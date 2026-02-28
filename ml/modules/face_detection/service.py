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
        self.frame_count = 0
        self.SKIP_FRAMES = 0 # Process every frame for maximum reliability
        self.last_boxes = []

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading YOLO-Face model (Pro Accuracy)...")
            try:
                # Lowering confidence threshold to 0.25 for better detection
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
        events = []
        
        # Performance optimization: Conditional skip
        if self.SKIP_FRAMES > 0 and self.frame_count % (self.SKIP_FRAMES + 1) != 0:
            return frame, [], self.last_boxes

        # Standard YOLO detection
        faces = self.detector.detect(frame)
        count = len(faces)
        boxes = []

        for (x, y, w, h, conf) in faces:
            boxes.append({
                "class": "Face",
                "x": int(x), "y": int(y), "w": int(w), "h": int(h), 
                "confidence": float(conf)
            })

        self.last_boxes = boxes

        # Event logic
        now = time.time()
        if count > 0 and (now - self.last_log_time > self.LOG_INTERVAL or count != self.last_count):
            max_conf = max((f[4] for f in faces), default=0.0)
            events.append({
                "camera_id": camera_id,
                "module_key": "face-detection",
                "label": "Face Detected",
                "confidence": float(max_conf),
                "timestamp": now,
                "meta": f"Detected: {count} faces"
            })
            self.last_count = count
            self.last_log_time = now
        elif count == 0 and self.last_count > 0:
            self.last_count = 0
            self.last_log_time = now # Throttle 0-count logs too

        return frame, events, boxes
