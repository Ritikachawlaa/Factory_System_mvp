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
    "intrusion": IntrusionService(),
    "loitering": LoiteringService(),
    "line_crossing": LineCrossingService(),
    "region_entrance": RegionEntranceService(),
    "heatmap": HeatmapService(),
    "face_rec": FaceRecognitionService(),
    "face_recognition": FaceRecognitionService(), # Alias
    "people_count": PeopleCountService(),
    "entry_exit": EntryExitService(),
    "human_detection": HumanDetectionService(),
    "face_detection": FaceDetectionService(),
    "crowd_density": CrowdDensityService(),
    "auto_tracking": AutoTrackingService(),
    "labour_counting": LabourCountingService()
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
        cap = cv2.VideoCapture(src_val)
    except Exception as e:
        logger.error(f"Camera {cam_id}: Exception opening source {source} - {e}")
        return

    if not cap.isOpened():
        logger.warning(f"Camera {cam_id}: Cannot open source {source}. Skipping.")
        return

    inference_times = deque(maxlen=100)
    last_metrics_send = time.time()
    last_config_check = time.time()

    while True:
        now = time.time()
        
        # Periodic DB sync: allow UI toggles to resume inference without restarting thread
        if now - last_config_check >= 5.0:
            try:
                cams = client.get_cameras()
                for c in cams:
                    if c['id'] == cam_id:
                        active_keys = [m['key'] for m in c.get('modules', []) if m['status'] == 'active']
                        break
            except Exception:
                pass
            last_config_check = now

        if not active_keys:
            logger.info(f"ML Idle: No active models for Camera {cam_id}.")
            if now - last_metrics_send >= 5.0:
                client.send_metrics(cam_id, 0.0) # Zero out frontend average
                last_metrics_send = now
            time.sleep(0.5)
            # Rapidly drop frames via grab() to prevent RTSP backend buffer bloat
            if cap:
                cap.grab()
            continue

        ret, frame = cap.read()
        if not ret:
            logger.warning(f"Camera {cam_id}: Failed to read frame. Retrying...")
            time.sleep(1)
            # Re-try opening? Or just continue loop? 
            # If stream broke, we might need to release and re-open.
            # Simple retry logic:
            cap.release()
            time.sleep(2)
            try:
                cap = cv2.VideoCapture(src_val)
            except:
                pass
            continue

        # Resize for performance matching backend logic
        frame = cv2.resize(frame, (320, 240))

        start_time = time.time()

        for key in active_keys:
            service = SERVICES.get(key)
            if service:
                try:
                    # Run Inference
                    # Service now returns (frame, events)
                    # We discard the frame (no stream output from here yet)
                    _, events = service.process_frame(frame, camera_id=cam_id)
                    
                    if events:
                        for event in events:
                            logger.info(f"Camera {cam_id} [{key}]: Event {event['label']}")
                            client.send_detection(event)
                except Exception as e:
                    logger.error(f"Camera {cam_id}: Error running {key}: {e}")

        # Metrics Tracking
        inference_time_ms = (time.time() - start_time) * 1000
        inference_times.append(inference_time_ms)
        
        now = time.time()
        if now - last_metrics_send >= 5.0 and len(inference_times) > 0:
            avg_ms = sum(inference_times) / len(inference_times)
            client.send_metrics(cam_id, avg_ms)
            last_metrics_send = now

        # Basic throttle
        time.sleep(0.03) # ~30 FPS max

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
