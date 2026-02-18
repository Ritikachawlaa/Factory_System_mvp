import os
import time
import cv2
import logging
from dotenv import load_dotenv
import threading
from adapters.api_client import APIClient

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
    source = camera['source'] # "0", "rtsp://...", etc
    modules = camera.get('modules', [])

    # Filter active modules for this camera
    active_keys = [m['key'] for m in modules if m['status'] == 'active']
    
    if not active_keys:
        logger.info(f"Camera {cam_id}: No active modules in DB. Forcing 'face_rec' for verification.")
        active_keys = ['face_rec']

    logger.info(f"Camera {cam_id}: Starting inference for {active_keys} on source {source}")

    # Open Cam
    try:
        cap = cv2.VideoCapture(int(source) if source.isdigit() else source)
    except:
        cap = cv2.VideoCapture(source)

    if not cap.isOpened():
        logger.error(f"Camera {cam_id}: Failed to open source {source}")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            logger.warning(f"Camera {cam_id}: Failed to read frame. Retrying...")
            time.sleep(1)
            continue

        # Resize for performance matching backend logic
        frame = cv2.resize(frame, (320, 240))

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
