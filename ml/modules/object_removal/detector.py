"""
Object Removal – Detector
Detects persons and objects (tools, equipment, bags, etc.).
Based on the reference Object_removal project.
"""
from utils.base_detector import BaseDetector

# COCO class IDs: 0=person, 13=bench, 24=backpack, 25=umbrella, 26=handbag,
# 28=suitcase, 39=bottle, 41=cup, 56=chair, 63=laptop, 64=mouse, 67=cell phone
REMOVAL_CLASSES = [0, 13, 24, 25, 26, 28, 39, 41, 56, 63, 64, 67]

class RemovalDetector(BaseDetector):
    def __init__(self, conf=0.4):
        # Using yolov8s.pt for accuracy
        super().__init__(model_path="yolov8s.pt", conf=conf)

    def detect_all(self, frame):
        """Detect persons and common removable objects."""
        return self.detect(frame, classes=REMOVAL_CLASSES)
