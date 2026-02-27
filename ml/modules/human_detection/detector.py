"""
Human Detection – Detector
Source: Ai_system_phase_1_repo/Core_model_1/ai_camera_system.py
Model : Core_Model_1.pt  (YOLO – class 0 = person)
"""
import os
from ultralytics import YOLO

import torch

# Path priority: local copy → Phase-1 repo copy → generic yolov8n
_LOCAL_MODEL = os.path.join(os.path.dirname(__file__), "..", "..", "models", "Core_Model_1.pt")
_PHASE1_MODEL = os.path.join(
    os.path.dirname(__file__), "..", "..", "..",
    "Ai_system_phase_1_repo", "Core_model_1", "Core_Model_1.pt"
)


def _resolve_model():
    for p in [_LOCAL_MODEL, _PHASE1_MODEL]:
        if os.path.exists(p):
            return p
    return "yolov8n.pt"        # fallback


class HumanDetector:
    def __init__(self, conf=0.25):
        self.model = YOLO(_resolve_model())
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.conf = conf

    def detect(self, frame):
        """Return list of (x1, y1, x2, y2, confidence) for every person."""
        # Use half precision on GPU for 2x speedup
        is_gpu = self.device.type == "cuda"
        results = self.model(frame, conf=self.conf, verbose=False, device=self.device, half=is_gpu)[0]
        detections = []
        for box in results.boxes:
            cls = int(box.cls[0])
            if cls == 0:                           # person
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                detections.append((x1, y1, x2, y2, conf))
        return detections
