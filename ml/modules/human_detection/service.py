"""
Human Detection – Service
Detects human presence and draws bounding boxes with confidence.
Generates events when new humans appear or count changes significantly.
"""
import cv2
import time
import logging
from .detector import HumanDetector

logger = logging.getLogger("human_detection")


class HumanDetectionService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.last_count = 0
        self.last_log_time = 0
        self.LOG_INTERVAL = 5          # emit event every 5 s at most

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading Human Detection model …")
            try:
                self.detector = HumanDetector(conf=0.4)
                self.model_loaded = True
                logger.info("Human Detection model loaded.")
            except Exception as e:
                logger.error(f"Human Detection model load failed: {e}")

    # ---- main entry point (same signature as every other module) ----------
    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, []

        detections = self.detector.detect(frame)
        count = len(detections)
        events = []

        boxes = []
        # Draw boxes
        for (x1, y1, x2, y2, conf) in detections:
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, f"Human {conf:.0%}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            boxes.append({
                "class": "person",
                "x": int(x1),
                "y": int(y1),
                "w": int(x2 - x1),
                "h": int(y2 - y1),
                "confidence": float(conf)
            })

        cv2.putText(frame, f"Humans: {count}", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        # Event logic
        now = time.time()
        changed = abs(count - self.last_count) >= 1
        timed = now - self.last_log_time > self.LOG_INTERVAL

        if count > 0 and (changed or timed):
            events.append({
                "camera_id": camera_id,
                "module_key": "human_detection",
                "label": "Human Detected",
                "confidence": max((d[4] for d in detections), default=0),
                "timestamp": now,
                "meta": f"Count: {count}"
            })
            self.last_count = count
            self.last_log_time = now

        return frame, events, boxes
