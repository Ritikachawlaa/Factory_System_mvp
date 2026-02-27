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
        for i, (x1, y1, x2, y2, conf) in enumerate(detections):
            # Use a slightly different color or thickness if needed, but keeping green for consistency
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            # Label with ID and confidence
            label = f"P{i+1}: {conf:.0%}"
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(frame, (x1, y1 - 20), (x1 + w, y1), (0, 255, 0), -1)
            cv2.putText(frame, label, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
            
            boxes.append({
                "id": i + 1,
                "class": "person",
                "x": int(x1),
                "y": int(y1),
                "w": int(x2 - x1),
                "h": int(y2 - y1),
                "confidence": float(conf)
            })

        cv2.putText(frame, f"Total Humans: {count}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # Event logic
        now = time.time()
        # Log if count changed or interval passed
        changed = count != self.last_count
        timed = now - self.last_log_time > self.LOG_INTERVAL

        if count > 0 and (changed or timed):
            events.append({
                "camera_id": camera_id,
                "module_key": "human-detection",
                "label": "Human Detected",
                "confidence": max((d[4] for d in detections), default=0),
                "timestamp": now,
                "meta": f"Count: {count}" # This will be stored in metadata column
            })
            self.last_count = count
            self.last_log_time = now
        elif count == 0 and self.last_count > 0:
            # Explicitly log when 0 humans are detected to mark the end of a presence period
            events.append({
                "camera_id": camera_id,
                "module_key": "human-detection",
                "label": "No Humans",
                "confidence": 0.0,
                "timestamp": now,
                "meta": "Count: 0"
            })
            self.last_count = 0
            self.last_log_time = now

        return frame, events, boxes
