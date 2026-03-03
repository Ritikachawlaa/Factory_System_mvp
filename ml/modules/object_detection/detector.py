"""
Object Detection – Detector
Detects a wide variety of common objects (COCO classes).
"""
from utils.base_detector import BaseDetector

class ObjectDetector(BaseDetector):
    def __init__(self, conf=0.4):
        # Using yolov8s.pt which has person and common objects
        super().__init__(model_path="yolov8s.pt", conf=conf)

    def detect_all(self, frame):
        """
        Detect all supported COCO objects.
        Passing classes=None to detect all 80 classes.
        """
        detections = self.detect(frame, classes=None)
        return detections
