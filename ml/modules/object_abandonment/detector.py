"""
Object Abandonment – Detector
Detects persons and various objects (bags, suitcases, boxes, etc.).
Based on the proven Object_Abandon reference pattern.
"""
from utils.base_detector import BaseDetector

# Expanded list of COCO class IDs for abandon-able objects
# 0: person, 13: bench, 24: backpack, 25: umbrella, 26: handbag, 
# 28: suitcase, 39: bottle, 41: cup, 56: chair, 63: laptop,
# 67: cell phone, 73: book, 76: scissors
ABANDONABLE_CLASSES = [0, 13, 24, 25, 26, 28, 39, 41, 56, 63, 67, 73, 76]

class AbandonmentDetector(BaseDetector):
    def __init__(self, conf=0.4):
        # Using yolov8s.pt which has person and common objects
        super().__init__(model_path="yolov8s.pt", conf=conf)

    def detect_objects(self, frame):
        """
        Detect persons and potential abandoned objects.
        Returns list of (x1, y1, x2, y2, confidence, class_id).
        """
        detections = self.detect(frame, classes=ABANDONABLE_CLASSES)
        return detections
