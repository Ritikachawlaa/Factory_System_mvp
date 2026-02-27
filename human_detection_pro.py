import cv2
import time
import os
import requests
import torch
import logging
import threading
from queue import Queue, Empty
from ultralytics import YOLO

# --- Configuration ---
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "https://api.camai.in")
MEDIAMTX_RTSP_URL = os.getenv("MEDIAMTX_RTSP_URL", "rtsp://stream.camai.in:8554")
CAMERA_ID = int(os.getenv("CAMERA_ID", 16))
STREAM_PATH = os.getenv("STREAM_PATH", "camera1")
CONF_THRESHOLD = 0.3
PROCESS_WIDTH = 640
PROCESS_HEIGHT = 640

# --- Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("human_detection_pro")

# --- Optimized Streaming Worker ---
class DetectionStreamer:
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
        self.queue = Queue(maxsize=5)
        self.session = requests.Session()
        self.active = True
        self.worker = threading.Thread(target=self._worker, daemon=True)
        self.worker.start()

    def _worker(self):
        while self.active:
            try:
                payload = self.queue.get(timeout=1.0)
                try:
                    self.session.post(f"{self.base_url}/api/detections/stream", json=payload, timeout=0.5)
                except Exception:
                    pass
                self.queue.task_done()
            except Empty:
                continue

    def push(self, camera_id, detections):
        if self.queue.full():
            try:
                self.queue.get_nowait()
                self.queue.task_done()
            except Empty:
                pass
        self.queue.put({"camera_id": camera_id, "detections": detections})

# --- Core Detector ---
class HumanDetector:
    def __init__(self, conf=0.3):
        logger.info("Initializing YOLOv8s...")
        # Use small (s) instead of nano (n) for much better accuracy if possible
        self.model = YOLO("yolov8s.pt") 
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.conf = conf
        logger.info(f"YOLO Loaded on {self.device}")

    def detect(self, frame):
        # Resize once for inference
        results = self.model(frame, conf=self.conf, verbose=False, device=self.device, half=(self.device.type == "cuda"))[0]
        detections = []
        for box in results.boxes:
            cls = int(box.cls[0])
            if cls == 0:  # person
                # Get as native python types
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                conf = float(box.conf[0])
                detections.append((x1, y1, x2, y2, conf))
        return detections

# --- Main Service ---
def run_service():
    detector = HumanDetector(conf=CONF_THRESHOLD)
    streamer = DetectionStreamer(BACKEND_API_URL)
    
    rtsp_url = f"{MEDIAMTX_RTSP_URL}/{STREAM_PATH}"
    logger.info(f"Connecting to RTSP: {rtsp_url}")
    
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        logger.error("Failed to open RTSP stream.")
        return

    last_boxes_found = False
    
    while True:
        ret, frame = cap.read()
        if not ret:
            logger.warning("Failed to read frame, reconnecting...")
            cap.release()
            time.sleep(2)
            cap = cv2.VideoCapture(rtsp_url)
            continue
            
        orig_h, orig_w = frame.shape[:2]
        
        # Internal processing at 640x640 for high accuracy
        processed_frame = cv2.resize(frame, (PROCESS_WIDTH, PROCESS_HEIGHT))
        scale_x = orig_w / float(PROCESS_WIDTH)
        scale_y = orig_h / float(PROCESS_HEIGHT)
        
        detections = detector.detect(processed_frame)
        
        if detections:
            boxes = []
            for (x1, y1, x2, y2, conf) in detections:
                boxes.append({
                    "class": "person",
                    "x": int(x1 * scale_x),
                    "y": int(y1 * scale_y),
                    "w": int((x2 - x1) * scale_x),
                    "h": int((y2 - y1) * scale_y),
                    "confidence": conf
                })
            streamer.push(CAMERA_ID, boxes)
            last_boxes_found = True
        elif last_boxes_found:
            # Clear UI once
            streamer.push(CAMERA_ID, [])
            last_boxes_found = False

if __name__ == "__main__":
    run_service()
