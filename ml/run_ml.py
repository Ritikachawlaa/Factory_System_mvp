import os
import time
import cv2
import logging
from dotenv import load_dotenv
import threading
from collections import deque
from adapters.api_client import APIClient
#testing ci/cd
# Import Modules
# Since we moved them to ml/modules, make sure PYTHONPATH is correct or relative imports
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from modules.intrusion.service import IntrusionService
from modules.loitering.service import LoiteringService
from modules.line_crossing.service import LineCrossingService
from modules.region_entrance.service import RegionEntranceService
from modules.heatmap.service import HeatmapService
from modules.face_recognition.service import FaceRecognitionService
from modules.people_count.service import PeopleCountService
from modules.entry_exit.service import EntryExitService
from modules.human_detection.service import HumanDetectionService
from modules.face_detection.service import FaceDetectionService
from modules.crowd_density.service import CrowdDensityService
from modules.auto_tracking.service import AutoTrackingService
from modules.labour_counting.service import LabourCountingService
from modules.ppe_detection.service import PPEDetectionService
from modules.object_abandonment.service import ObjectAbandonmentService
from modules.object_removal.service import ObjectRemovalService
from modules.object_detection.service import ObjectDetectionService
from utils.integration_service import integration_service

# Load Env
load_dotenv()

# Logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ml_service")

# Services Map
SERVICES = {
    "intrusion-detection": IntrusionService(),
    "loitering-detection": LoiteringService(),
    "line-crossing": LineCrossingService(),
    "entry-exit": EntryExitService(),
    "heatmap": HeatmapService(),
    "face-recognition": FaceRecognitionService(),
    "people-count": PeopleCountService(),
    "human-detection": HumanDetectionService(),
    "face-detection": FaceDetectionService(),
    "crowd-density": CrowdDensityService(),
    "auto-tracking": AutoTrackingService(),
    "labour-counting": LabourCountingService(),
    "ppe-detection": PPEDetectionService(),
    "object-abandonment": ObjectAbandonmentService(),
    "object-removal": ObjectRemovalService(),
    "object-detection": ObjectDetectionService()
}

class SafeCapture:
    """
    Background thread to continually 'grab' frames from a cv2.VideoCapture.
    This prevents the internal OS/OpenCV buffer from accumulating old frames,
    ensuring we always get the 'Latest' frame when requested.
    """
    def __init__(self, src):
        self.src = src
        # Determine if source is webcam or stream
        self.src_val = int(src) if str(src).isdigit() else src
        
        self.cap = None
        self._open_cap()
        
        self.frame = None
        self.running = True
        self.lock = threading.Lock()
        self.thread = threading.Thread(target=self._update, daemon=True)
        self.thread.start()
        logger.info(f"SafeCapture background thread started for {self.src_val}")

    def _open_cap(self):
        try:
            if isinstance(self.src_val, str) and self.src_val.startswith("rtsp://"):
                os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|analyzeduration;1000000|probesize;1000000|timeout;5000000"
                self.cap = cv2.VideoCapture(self.src_val, cv2.CAP_FFMPEG)
            else:
                self.cap = cv2.VideoCapture(self.src_val)
        except Exception as e:
            logger.error(f"SafeCapture: Error opening {self.src_val}: {e}")

    def _update(self):
        while self.running:
            if self.cap is None or not self.cap.isOpened():
                self._open_cap()
                if self.cap is None or not self.cap.isOpened():
                    time.sleep(5)
                    continue

            try:
                # grab() skips the decoding step for older frames in the buffer
                if not self.cap.grab():
                    time.sleep(0.1)
                    continue
                
                # retrieve() gets the latest grabbed frame
                ret, frame = self.cap.retrieve()
                if ret:
                    with self.lock:
                        self.frame = frame
                else:
                    time.sleep(0.1)
            except Exception as e:
                logger.debug(f"SafeCapture update loop error: {e}")
                time.sleep(1)

    def read(self):
        with self.lock:
            if self.frame is None:
                return False, None
            # Return a copy to avoid thread interference during processing
            return True, self.frame.copy()

    def release(self):
        self.running = False
        if self.thread.is_alive():
            self.thread.join(timeout=1)
        if self.cap:
            self.cap.release()

def run_camera_inference(camera, client):
    """
    Thread function to handle a single camera stream.
    """
    cam_id = camera['id']
    source = camera['source'] # Original source (may be local IP)
    stream_path = camera.get('stream_path', '').strip() if camera.get('stream_path') else ''
    modules = camera.get('modules', [])

    # Filter active modules for this camera
    active_keys = [m['key'] for m in modules if m['status'] == 'active']
    
    # --- Resolve video source ---
    # Priority: Use MediaMTX RTSP stream if stream_path is set (published via MediaMTX)
    # Fallback: Use direct source (for local/dev testing)
    from config import MEDIAMTX_RTSP_URL
    if stream_path:
        source = f"{MEDIAMTX_RTSP_URL}/{stream_path}"
        logger.info(f"Camera {cam_id}: Using MediaMTX RTSP stream: {source}")
    
    logger.info(f"Camera {cam_id}: Starting inference for {active_keys} on source {source}")

    # --- SAFE CAMERA INIT ---

    # If no RTSP configured yet (invalid or empty), skip safely
    if not source or str(source).strip() == "" or str(source) == "0":
        logger.warning(f"Camera {cam_id}: Invalid source '{source}'. Skipping camera.")
        return

    # Determine src_val for SafeCapture
    src_val = int(source) if str(source).isdigit() else source

    client = APIClient() # Client instantiated per thread

    sc = None
    while sc is None or not sc.cap.isOpened():
        try:
            sc = SafeCapture(src_val)
            if not sc.cap.isOpened():
                logger.warning(f"Camera {cam_id}: Cannot open source {src_val} with SafeCapture. Retrying in 5s...")
                time.sleep(5)
        except Exception as e:
            logger.error(f"Camera {cam_id}: Exception initializing SafeCapture for {src_val} - {e}. Retrying in 5s...")
            time.sleep(5)
    
    inference_times = deque(maxlen=100)
    last_metrics_send = time.time()
    last_config_check = 0 # Force immediate initial check
    last_heartbeat_send = 0
    engine_start_time = time.time()

    while True:
        now = time.time()
        
        # 1. Periodic DB sync: allow UI toggles to resume inference without restarting thread
        if now - last_config_check >= 5.0:
            try:
                cams = client.get_cameras()
                for c in cams:
                    if c['id'] == cam_id:
                        # Be flexible with status: 'active' or 'running' or 'enabled'
                        active_keys = [
                            m['key'] for m in c.get('modules', []) 
                            if m.get('status', '').lower() in ['active', 'running'] or m.get('enabled', False)
                        ]
                        break
            except Exception as e:
                logger.debug(f"Config sync failed for camera {cam_id}: {e}")
            last_config_check = now

        # 2. Module Heartbeats: Tell backend/dashboard we are alive even if nothing detected
        if now - last_heartbeat_send >= 10.0:
            for key in active_keys:
                client.send_heartbeat(cam_id, key, "running")
            # Also log for console debugging
            if active_keys:
                logger.info(f"--- HEARTBEAT: Camera {cam_id} active modules: {active_keys} ---")
            else:
                logger.info(f"--- HEARTBEAT: Camera {cam_id} has NO active modules ---")
            last_heartbeat_send = now

        if not active_keys:
            if now - last_metrics_send >= 5.0:
                client.send_metrics(cam_id, 0.0) 
                last_metrics_send = now
            time.sleep(1.0)
            # SafeCapture handles frame grabbing in background
            continue

        ret, frame = sc.read()
        if not ret:
            # If no frame yet, just wait a bit. SafeCapture handles reconnects.
            time.sleep(0.1)
            continue

        orig_h, orig_w = frame.shape[:2]
        # Standardizing on 640x640 for Pro Accuracy
        frame_resized = cv2.resize(frame, (640, 640))
        # Global Background Modules (Face Recognition / Tracking)
        # Default to enabled if not explicitly disabled in settings
        bg_modules_str = client.get_setting("background_modules")
        import json
        try:
            background_modules = json.loads(bg_modules_str) if bg_modules_str else ["auto-tracking", "face-recognition"]
        except:
            background_modules = ["auto-tracking", "face-recognition"]

        active_keys = list(active_keys)
        for bm in background_modules:
            if bm not in active_keys:
                active_keys.append(bm)
        
        scale_x = orig_w / 640.0
        scale_y = orig_h / 640.0

        start_time = time.time()
        
        aggregated_boxes = []
        any_module_had_boxes = False

        # --- Special Logic: Integrated Tracking & Face Recognition ---
        # If both are active, we want to link labels
        integrated_mode = "auto-tracking" in active_keys and "face-recognition" in active_keys
        
        tracking_results = []
        if "auto-tracking" in active_keys:
            service = SERVICES.get("auto-tracking")
            if service:
                try:
                    _, events, boxes = service.process_frame(frame_resized, camera_id=cam_id)
                    tracking_results = boxes # [{class, x, y, w, h, confidence}]
                    if events:
                        for event in events:
                            client.send_detection(event)
                except Exception as e:
                    logger.error(f"Integrated Tracking Error: {e}")

        # Process other modules (excluding tracking and face-rec if in integrated mode)
        for key in active_keys:
            if key == "auto-tracking": continue
            if key == "face-recognition" and integrated_mode: continue
            
            service = SERVICES.get(key)
            if service:
                try:
                    result = service.process_frame(frame_resized, camera_id=cam_id)
                    # Support both (frame, events) and (frame, events, boxes)
                    if len(result) == 3:
                        _, events, boxes = result
                        if boxes:
                            any_module_had_boxes = True
                            for b in boxes:
                                aggregated_boxes.append({
                                    "class": b.get("class", "object"),
                                    "x": int(b["x"] * scale_x),
                                    "y": int(b["y"] * scale_y),
                                    "w": int(b["w"] * scale_x),
                                    "h": int(b["h"] * scale_y),
                                    "confidence": b.get("confidence", 1.0)
                                })
                        service.last_boxes_found = len(boxes) > 0
                    else:
                        _, events = result
                    
                    if events:
                        for event in events:
                            client.send_detection(event)
                except Exception as e:
                    logger.error(f"Camera {cam_id}: Error running {key}: {e}")

        # Integrated Face Recognition
        if integrated_mode:
            face_service = SERVICES.get("face-recognition")
            for t_box in tracking_results:
                track_id_str = t_box["class"].replace("Track ID ", "")
                try:
                    track_id = int(track_id_str)
                except:
                    track_id = None

                # Crop the head area (rough top 30% of the box)
                x, y, w, h = t_box["x"], t_box["y"], t_box["w"], t_box["h"]
                head_h = int(h * 0.45)
                head_crop = frame_resized[max(0, y):min(640, y + head_h), max(0, x):min(640, x + w)]
                
                final_label = f"ID {track_id}" if track_id else "Person"
                
                if head_crop.size > 0:
                    _, events, faces = face_service.process_frame(
                        frame_resized, 
                        camera_id=cam_id, 
                        detection_frame=head_crop,
                        tracked_info={"track_id": track_id} if track_id else None
                    )
                    
                    if faces:
                        display_label = faces[0]["class"] # This is now "Name (ID: X)"
                        if "Unknown" not in display_label:
                            final_label = f"{display_label} [TID {track_id}]"
                    
                    if events:
                        for event in events:
                            client.send_detection(event)

                # Check IntegrationService for persistent name even if face recognition didn't run this frame
                if track_id:
                    persisted_identity = integration_service.get_identity(track_id)
                    if persisted_identity and "Unknown" not in persisted_identity:
                        final_label = f"{persisted_identity} [TID {track_id}]"

                # Add the tracked box with integrated label
                aggregated_boxes.append({
                    "class": final_label,
                    "x": int(t_box["x"] * scale_x),
                    "y": int(t_box["y"] * scale_y),
                    "w": int(t_box["w"] * scale_x),
                    "h": int(t_box["h"] * scale_y),
                    "confidence": t_box["confidence"]
                })
        elif "face-recognition" in active_keys:
            # Standalone mode
            service = SERVICES.get("face-recognition")
            try:
                _, events, boxes = service.process_frame(frame_resized, camera_id=cam_id)
                if boxes:
                    for b in boxes:
                        aggregated_boxes.append({
                            "class": b["class"],
                            "x": int(b["x"] * scale_x),
                            "y": int(b["y"] * scale_y),
                            "w": int(b["w"] * scale_x),
                            "h": int(b["h"] * scale_y),
                            "confidence": b["confidence"]
                        })
                if events:
                    for event in events:
                        client.send_detection(event)
            except Exception as e:
                logger.error(f"Standalone Face Rec Error: {e}")

        # Add tracking boxes if NOT in integrated mode (they would have been added above otherwise)
        if not integrated_mode and "auto-tracking" in active_keys:
             for b in tracking_results:
                aggregated_boxes.append({
                    "class": b["class"],
                    "x": int(b["x"] * scale_x),
                    "y": int(b["y"] * scale_y),
                    "w": int(b["w"] * scale_x),
                    "h": int(b["h"] * scale_y),
                    "confidence": b["confidence"]
                })

        # Live Streaming logic - AGGREGATED
        # We send MUST send something if EITHER:
        # A) We have boxes now
        # B) We HAD boxes last frame and now have none (to clear UI)
        last_frame_had_any_boxes = getattr(run_camera_inference, f"last_any_boxes_{cam_id}", False)
        
        if aggregated_boxes:
            client.send_detection_stream(cam_id, aggregated_boxes)
            setattr(run_camera_inference, f"last_any_boxes_{cam_id}", True)
        elif last_frame_had_any_boxes:
            # Clear UI exactly once
            client.send_detection_stream(cam_id, [])
            setattr(run_camera_inference, f"last_any_boxes_{cam_id}", False)

        # Metrics Tracking
        inference_time_ms = (time.time() - start_time) * 1000
        inference_times.append(inference_time_ms)
        
        if now - last_metrics_send >= 5.0 and len(inference_times) > 0:
            avg_ms = sum(inference_times) / len(inference_times)
            client.send_metrics(cam_id, avg_ms)
            last_metrics_send = now
        
        # Basic throttle
        time.sleep(0.01) # Faster loop for better real-time feel

def main():
    from config import ML_SERVICE_VERSION
    logger.info(f"Starting ML Service v{ML_SERVICE_VERSION}...")
    client = APIClient()

    # Pre-load heavy models (SAFE: ensures single load before threads)
    from utils import recognition
    recognition.load_models()
    
    # Retry finding cameras until successful
    cameras = []
    while not cameras:
        cameras = client.get_cameras()
        if not cameras:
            logger.warning("No cameras found or backend unreachable. Retrying in 5s...")
            time.sleep(5)

    threads = []
    for cam in cameras:
        t = threading.Thread(target=run_camera_inference, args=(cam, client))
        t.daemon = True # Kill when main dies
        t.start()
        threads.append(t)

    logger.info(f"Started {len(threads)} camera threads. Press Ctrl+C to stop.")
    
    try:
        while True:
            time.sleep(1)
            # Maybe heartbeat here?
    except KeyboardInterrupt:
        logger.info("Stopping...")

if __name__ == "__main__":
    main()
