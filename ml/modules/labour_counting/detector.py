"""
Labour Counting – Detector
Detects persons using yolov8s.pt (COCO class 0 = person).
The service layer applies workforce-specific logic (vest colour classification).
"""
from utils.base_detector import BaseDetector


class LabourDetector(BaseDetector):
    def __init__(self, conf=0.4):
        # MUST specify yolov8s.pt explicitly, otherwise BaseDetector
        # falls back to Core_Model_1.pt (face model) which has no "person" class
        super().__init__(model_path="yolov8s.pt", conf=conf)
