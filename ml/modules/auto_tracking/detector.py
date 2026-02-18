"""
Auto Tracking – Detector
Source: Ai_system_phase_1_repo/Core_model_1/ai_camera_system.py  (model.track with persist=True)
Model : Core_Model_1.pt  (YOLO)

Uses YOLO's built-in tracker (BoT-SORT / ByteTrack) via model.track(persist=True)
to assign persistent IDs to detected persons across frames.
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


class AutoTrackingDetector:
    def __init__(self, conf=0.4):
        self.model = YOLO(_resolve_model())
        self.conf = conf

    def track(self, frame):
        """
        Uses YOLO's built-in tracker (same as ai_camera_system.py:30).
        Returns list of (x1, y1, x2, y2, track_id, confidence) for persons.
        """
        results = self.model.track(frame, persist=True, conf=self.conf, verbose=False)
        tracks = []

        if results and results[0].boxes is not None:
            for box in results[0].boxes:
                cls = int(box.cls[0])
                if cls != 0:
                    continue
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                track_id = int(box.id[0]) if box.id is not None else -1
                conf = float(box.conf[0])
                tracks.append((x1, y1, x2, y2, track_id, conf))

        return tracks
