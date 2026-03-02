"""
Object Removal – Detector
Detects persons and objects (tools, equipment).
"""
from utils.base_detector import BaseDetector

class RemovalDetector(BaseDetector):
    def __init__(self, conf=0.4):
        # Using yolov8s.pt
        super().__init__(model_path="yolov8s.pt", conf=conf)

    def detect_all(self, frame):
        """Detect persons and objects."""
        # Generic objects + person
        classes = [0, 24, 26, 28, 39, 41, 64, 67] # Person + common factory/office items
        return self.detect(frame, classes=classes)
