"""
Labour Counting – Detector
Source: Ai_system_phase_1_repo/Core_model_1/ai_camera_system.py
Model : Core_Model_1.pt  (YOLO – class 0 = person)

Same person detector as human_detection, but the service layer
applies workforce-specific logic (shift-based counting, reporting).
"""
import os
from ultralytics import YOLO

_LOCAL_MODEL = os.path.join(os.path.dirname(__file__), "..", "..", "models", "Core_Model_1.pt")
_PHASE1_MODEL = os.path.join(
    os.path.dirname(__file__), "..", "..", "..",
    "Ai_system_phase_1_repo", "Core_model_1", "Core_Model_1.pt"
)


def _resolve_model():
    for p in [_LOCAL_MODEL, _PHASE1_MODEL]:
        if os.path.exists(p):
            return p
    return "yolov8n.pt"


class LabourDetector:
    def __init__(self, conf=0.25):
        self.model = YOLO(_resolve_model())
        self.conf = conf

    def detect(self, frame):
        """Return list of (x1, y1, x2, y2) for every person on frame."""
        results = self.model(frame, conf=self.conf, verbose=False)[0]
        boxes = []
        for box in results.boxes:
            cls = int(box.cls[0])
            if cls == 0:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                boxes.append((x1, y1, x2, y2))
        return boxes
