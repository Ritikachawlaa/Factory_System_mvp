"""
Face Detection – Service
Detects faces in each frame and emits events when faces are found.
Rewritten to match the smooth, every-frame processing of Human Detection.
"""
import cv2
import time
import logging
from .detector import FaceDetector

logger = logging.getLogger("face_detection")

class FaceDetectionService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.last_count = 0
        self.last_log_time = 0
        self.LOG_INTERVAL = 5
        self.frame_count = 0

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading YOLO-Face model (High-Speed Optimized)...")
            try:
                # Lowering confidence threshold to 0.25 to prevent flickering on edge cases
                self.detector = FaceDetector(conf=0.25)
                self.model_loaded = True
                logger.info("YOLO-Face model loaded.")
            except Exception as e:
                logger.error(f"YOLO-Face load failed: {e}")

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, [], []
            
        self.frame_count += 1
        
        # 1. Inference Logic (Every Frame for Maximum Smoothness)
        faces = self.detector.detect(frame)
        count = len(faces)
        
        events = []
        boxes = []

        for i, (x, y, w, h, conf) in enumerate(faces):
            # Scale coordinates and format for UI
            boxes.append({
                "id": i + 1,
                "class": "Face",
                "x": int(x), "y": int(y), "w": int(w), "h": int(h), 
                "confidence": float(conf)
            })

            # Native draw for debug/WebRTC
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 255), 2)
            label = f"Face: {conf:.2f}"
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 255), 1)

        # 3. Event Logic
        now = time.time()
        if count > 0 and (now - self.last_log_time > self.LOG_INTERVAL or count != self.last_count):
            max_conf = max((b["confidence"] for b in boxes), default=0.0)
            events.append({
                "camera_id": camera_id,
                "module_key": "face-detection",
                "label": "Face Detected",
                "confidence": float(max_conf),
                "timestamp": now,
                "meta": f"Count: {count}" # Matches human detection meta format
            })
            self.last_count = count
            self.last_log_time = now
        elif count == 0 and self.last_count > 0:
            events.append({
                "camera_id": camera_id,
                "module_key": "face-detection",
                "label": "No Faces",
                "confidence": 0.0,
                "timestamp": now,
                "meta": "Count: 0"
            })
            self.last_count = 0
            self.last_log_time = now 

        return frame, events, boxes
