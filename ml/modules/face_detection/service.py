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
        self.SKIP_FRAMES = 2 # High-Speed: Process every 3rd frame to reduce YOLO latency
        self.last_boxes = []

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading YOLO-Face model (Balanced Optimization)...")
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
        
        # 1. Inference Logic (Scheduled)
        is_inference_frame = (self.frame_count % (self.SKIP_FRAMES + 1) == 0)
        
        if is_inference_frame:
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
            self.last_count = count
        else:
            # Use cached results for skipped frames to keep stream interactive
            boxes = self.last_boxes
            count = self.last_count

        # 2. Drawing Logic (Every Frame for Burn-in Redundancy)
        for b in boxes:
            x, y, w, h = b["x"], b["y"], b["w"], b["h"]
            conf = b["confidence"]
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 255), 2)
            label = f"Face: {conf:.2f}"
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 255), 1)

        # 3. Event Logic (Only on inference frames to avoid duplicate counts)
        now = time.time()
        if is_inference_frame:
            if count > 0 and (now - self.last_log_time > self.LOG_INTERVAL or count != self.last_count):
                max_conf = max((b["confidence"] for b in boxes), default=0.0)
                events.append({
                    "camera_id": camera_id,
                    "module_key": "face-detection",
                    "label": "Face Detected",
                    "confidence": float(max_conf),
                    "timestamp": now,
                    "meta": f"Detected: {count} faces"
                })
                self.last_log_time = now
            elif count == 0 and self.last_count > 0:
                self.last_count = 0
                self.last_log_time = now 

        return frame, events, boxes
