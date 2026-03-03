"""
Object Detection – Service
Detects and draws a variety of common objects.
"""
import cv2
import logging
from .detector import ObjectDetector

logger = logging.getLogger("object_detection")

class ObjectDetectionService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.last_boxes_found = False

    def _load(self):
        if not self.model_loaded:
            try:
                self.detector = ObjectDetector(conf=0.4)
                self.model_loaded = True
                logger.info("Object Detection model loaded.")
            except Exception as e:
                logger.error(f"Object Detection model load failed: {e}")

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, []

        detections = self.detector.detect_all(frame)
        events = []
        boxes = []

        for det in detections:
            x1, y1, x2, y2, conf, cls_id = det
            label = self.detector.model.names[cls_id]
            
            # Draw box on frame
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
            cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

            boxes.append({
                "class": label,
                "x": int(x1),
                "y": int(y1),
                "w": int(x2 - x1),
                "h": int(y2 - y1),
                "confidence": float(conf)
            })

        return frame, events, boxes
