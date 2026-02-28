"""
Face Detection – Service
Detects faces in each frame and emits events when faces are found.
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
        self.last_boxes_found = False

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading YOLO-Face model...")
            try:
                self.detector = FaceDetector(conf=0.4)
                self.model_loaded = True
                logger.info("YOLO-Face model loaded.")
            except Exception as e:
                logger.error(f"YOLO-Face load failed: {e}")

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, [], []
            
        # Try YOLO first (fast)
        faces = self.detector.detect(frame)
        
        # If no faces and we want robust detection, could fallback to retinaface
        # But for detection service, we usually stick to one. 
        # Let's just ensure we are using the best settings.
        
        count = len(faces)
        events = []
        boxes = []

        # Draw rectangles
        for (x, y, w, h, conf) in faces:
            # We don't draw in python anymore, we let frontend do it via boxes
            # But the user asked for "bounding boxes at faces" so I'll keep the python drawing too
            # for the direct stream if they are viewing that.
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 255), 2)
            
            boxes.append({
                "class": "Face",
                "x": int(x), "y": int(y), "w": int(w), "h": int(h), 
                "confidence": float(conf)
            })

        # Event logic
        now = time.time()
        # Always log if faces found to keep dashboard updated
        if count > 0 and (now - self.last_log_time > self.LOG_INTERVAL or count != self.last_count):
            max_conf = max((f[4] for f in faces), default=0.0)
            events.append({
                "camera_id": camera_id,
                "module_key": "face-detection",
                "label": "Face Intelligence Triggered",
                "confidence": float(max_conf),
                "timestamp": now,
                "meta": f"Detected: {count} faces"
            })
            self.last_count = count
            self.last_log_time = now

        return frame, events, boxes
