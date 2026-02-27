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
    "labour-counting": LabourCountingService()
}

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

    try:
        # Check if source is digit (local webcam) or string (RTSP/File)
        src_val = int(source) if str(source).isdigit() else source
        
        if isinstance(src_val, str) and src_val.startswith("rtsp://"):
            import os
            os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|analyzeduration;1000000|probesize;1000000|timeout;5000000"
            cap = cv2.VideoCapture(src_val, cv2.CAP_FFMPEG)
        else:
            cap = cv2.VideoCapture(src_val)
            
    except Exception as e:
        logger.error(f"Camera {cam_id}: Exception opening source {source} - {e}")
        return

    if not cap.isOpened():
        logger.warning(f"Camera {cam_id}: Cannot open source {source}. Skipping.")
        return

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
            if cap: cap.grab()
            continue

        ret, frame = cap.read()
        if not ret:
            logger.warning(f"Camera {cam_id}: Failed to read frame. Reconnecting in 2s...")
            cap.release()
            time.sleep(2)
            try:
                if isinstance(src_val, str) and src_val.startswith("rtsp://"):
                    os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|analyzeduration;1000000|probesize;1000000|timeout;5000000"
                    cap = cv2.VideoCapture(src_val, cv2.CAP_FFMPEG)
                else:
                    cap = cv2.VideoCapture(src_val)
            except:
                pass
            continue

        orig_h, orig_w = frame.shape[:2]
        # Standardizing on 640x640 for Pro Accuracy
        frame_resized = cv2.resize(frame, (640, 640))
        scale_x = orig_w / 640.0
        scale_y = orig_h / 640.0

        start_time = time.time()
        
        aggregated_boxes = []
        any_module_had_boxes = False

        for key in active_keys:
            service = SERVICES.get(key)
            if service:
                try:
                    # Run Inference
                    result = service.process_frame(frame_resized, camera_id=cam_id)
                    
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
                        
                        # Set individual service state for local tracking if needed
                        service.last_boxes_found = len(boxes) > 0
                    else:
                        _, events = result
                    
                    if events:
                        for event in events:
                            client.send_detection(event)
                except Exception as e:
                    logger.error(f"Camera {cam_id}: Error running {key}: {e}")

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
    logger.info("Starting ML Service...")
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
