from utils.base_detector import BaseDetector

class PersonDetector(BaseDetector):
    def __init__(self, model_path="yolov8s.pt"):
        super().__init__(model_path=model_path, conf=0.3)

    def detect(self, frame):
        """Detect persons and return (x1, y1, x2, y2) tuples."""
        detections = super().detect(frame, classes=[0])
        return [(d[0], d[1], d[2], d[3]) for d in detections]
