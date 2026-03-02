"""
Object Abandonment – Detector
Detects persons and various objects (bags, suitcases, boxes).
"""
from utils.base_detector import BaseDetector

class AbandonmentDetector(BaseDetector):
    def __init__(self, conf=0.4):
        # Using yolov8s.pt which has person and common objects
        super().__init__(model_path="yolov8s.pt", conf=conf)

    def detect_objects(self, frame):
        """
        Detect persons and potential abandoned objects.
        COCO classes: 0: person, 24: backpack, 26: handbag, 28: suitcase, 39: bottle, 67: cell phone, etc.
        """
        classes = [0, 24, 26, 28, 39, 67] # Person + common abandon-able items
        detections = self.detect(frame, classes=classes)
        return detections
