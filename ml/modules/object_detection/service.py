"""
Object Detection – Service
Detects and draws a variety of common objects.
Simplified from the reference Object_Abandon pattern for reliability.
"""
import cv2
import time
import logging
from .detector import ObjectDetector

logger = logging.getLogger("object_detection")

class ObjectDetectionService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.last_boxes_found = False
        self.last_log_time = 0
        self.LOG_INTERVAL = 5

    def _load(self):
        if not self.model_loaded:
            try:
                self.detector = ObjectDetector()
                self.model_loaded = True
                logger.info("Object Detection service ready.")
            except Exception as e:
                logger.error(f"Object Detection model load failed: {e}")

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, [], []

        detections = self.detector.detect(frame)
        events = []
        boxes = []

        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            label = det["class"]
            conf = det["confidence"]
            
            # Skip "person" for object detection — other modules handle that
            if label == "person":
                continue

            track_id = det.get("track_id")

            # Draw on frame
            color = (0, 255, 0)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            id_tag = f" #{track_id}" if track_id else ""
            display = f"{label}{id_tag} {conf:.0%}"
            cv2.putText(frame, display, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            boxes.append({
                "class": label,
                "x": int(x1),
                "y": int(y1),
                "w": int(x2 - x1),
                "h": int(y2 - y1),
                "confidence": conf
            })

        # Generate events periodically
        now = time.time()
        if boxes and (now - self.last_log_time > self.LOG_INTERVAL):
            events.append({
                "camera_id": camera_id,
                "module_key": "object-detection",
                "label": "Objects Detected",
                "confidence": max(b["confidence"] for b in boxes),
                "timestamp": now,
                "meta": f"Count: {len(boxes)}"
            })
            self.last_log_time = now

        return frame, events, boxes
