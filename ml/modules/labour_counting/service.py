"""
Labour Counting – Service
Counts workers (persons) on site and emits periodic workforce-count events.
Designed for shift-based monitoring of labour presence.
"""
import cv2
import time
import logging
from .detector import LabourDetector

logger = logging.getLogger("labour_counting")


class LabourCountingService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.last_count = 0
        self.last_log_time = 0
        self.LOG_INTERVAL = 15          # report every 15 s (workforce reports less chatty)

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading Labour Counting model …")
            try:
                self.detector = LabourDetector(conf=0.4)
                self.model_loaded = True
                logger.info("Labour Counting model loaded.")
            except Exception as e:
                logger.error(f"Labour Counting model load failed: {e}")

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, []

        boxes = self.detector.detect(frame)
        count = len(boxes)
        events = []
        bounding_boxes = []

        # Draw boxes
        for (x1, y1, x2, y2) in boxes:
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 165, 0), 2)
            bounding_boxes.append({
                "class": "Worker",
                "x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1), "confidence": 1.0
            })

        cv2.putText(frame, f"Workers: {count}", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 165, 0), 2)

        # Event logic
        now = time.time()
        changed = abs(count - self.last_count) >= 2
        timed = now - self.last_log_time > self.LOG_INTERVAL

        if count > 0 and (changed or timed):
            events.append({
                "camera_id": camera_id,
                "module_key": "labour-counting",
                "label": "Workforce Count",
                "confidence": 1.0,
                "timestamp": now,
                "meta": f"Workers on site: {count}"
            })
            self.last_count = count
            self.last_log_time = now

        return frame, events, bounding_boxes
