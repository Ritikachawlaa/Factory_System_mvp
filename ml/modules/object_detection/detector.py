"""
Object Detection – Detector
Detects a wide variety of common objects (COCO classes).
"""
from utils.base_detector import BaseDetector

class ObjectDetector(BaseDetector):
    def __init__(self, conf=0.65):
        # Using yolov8n.pt (Nano) for speed and higher conf for strictness
        super().__init__(model_path="yolov8n.pt", conf=conf)

    def detect_all(self, frame):
        """
        Detect all supported COCO objects.
        Passing classes=None to detect all 80 classes.
        """
        detections = self.detect(frame, classes=None)
        return detections
