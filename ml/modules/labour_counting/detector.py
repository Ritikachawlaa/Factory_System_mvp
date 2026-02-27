"""
Labour Counting – Detector
Source: Ai_system_phase_1_repo/Core_model_1/ai_camera_system.py
Model : Core_Model_1.pt  (YOLO – class 0 = person)

Same person detector as human_detection, but the service layer
applies workforce-specific logic (shift-based counting, reporting).
"""
from utils.base_detector import BaseDetector

class LabourDetector(BaseDetector):
    def __init__(self, conf=0.3):
        super().__init__(conf=conf)

    def detect(self, frame):
        """Detect persons and return (x1, y1, x2, y2) tuples."""
        detections = super().detect(frame, classes=[0])
        return [(d[0], d[1], d[2], d[3]) for d in detections]
