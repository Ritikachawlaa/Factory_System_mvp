"""
Object Detection – Detector
Detects a wide variety of common objects (COCO classes).
"""
from utils.base_detector import BaseDetector

class ObjectDetector(BaseDetector):
    def __init__(self, conf=0.35):
        # Using yolov8n.pt (Nano) for speed; conf=0.35 to detect everyday objects
        super().__init__(model_path="yolov8n.pt", conf=conf)

    def detect_all(self, frame):
        """
        Detect all supported COCO objects with tracking.
        Returns list of (x1, y1, x2, y2, track_id, confidence, class_id).
        """
        tracks = self.track(frame, classes=None)
        return tracks
