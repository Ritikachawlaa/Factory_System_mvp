"""
Crowd Density – Detector
Source: Ai_system_phase_1_repo/Core_model_1/ai_camera_system.py  (grid density logic lines 20-58)
Model : Core_Model_1.pt  (YOLO – class 0 = person)

Uses the SAME 4×4 grid density approach from the Phase-1 repo:
  • Detect all persons with YOLO
  • Map each centroid to a grid cell
  • Report per-cell counts + overall density
"""
import os
import numpy as np
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

GRID_SIZE = 4          # 4×4 grid – same as Phase-1 repo


class CrowdDensityDetector:
    def __init__(self, conf=0.4):
        self.model = YOLO(_resolve_model())
        self.conf = conf

    def detect(self, frame):
        """
        Returns:
            boxes  : list of (x1, y1, x2, y2)
            grid   : np.ndarray (GRID_SIZE × GRID_SIZE) with per-cell person count
            density: float  (people_count / frame_area)
        """
        h, w = frame.shape[:2]
        results = self.model(frame, conf=self.conf, verbose=False)[0]

        boxes = []
        grid = np.zeros((GRID_SIZE, GRID_SIZE), dtype=int)

        for box in results.boxes:
            cls = int(box.cls[0])
            if cls != 0:
                continue
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            boxes.append((x1, y1, x2, y2))

            # Grid cell (same maths as ai_camera_system.py:54-58)
            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)
            gx = min(int(cx / (w / GRID_SIZE)), GRID_SIZE - 1)
            gy = min(int(cy / (h / GRID_SIZE)), GRID_SIZE - 1)
            grid[gy][gx] += 1

        density = len(boxes) / (h * w) if (h * w) > 0 else 0
        return boxes, grid, density
