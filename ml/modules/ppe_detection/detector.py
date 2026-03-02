"""
PPE Detection – Detector
Detects persons and PPE items (helmet, vest).
"""
from utils.base_detector import BaseDetector

class PPEDetector(BaseDetector):
    def __init__(self, conf=0.4):
        # BaseDetector will look in ml/models/
        super().__init__(model_path="ppe_best.pt", conf=conf)
        self.person_detector = BaseDetector(model_path="yolov8s.pt", conf=conf)

    def detect_all(self, frame):
        """Detect persons and PPE items."""
        persons = self.person_detector.detect(frame, classes=[0])
        ppe_items = self.detect(frame, classes=[0, 1, 2, 3]) # Assuming ppe_best.pt classes include helmet, vest etc.
        return persons, ppe_items
