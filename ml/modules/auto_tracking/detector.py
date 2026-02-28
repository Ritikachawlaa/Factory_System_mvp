"""
Auto Tracking – Detector
Source: Ai_system_phase_1_repo/Core_model_1/ai_camera_system.py  (model.track with persist=True)
Model : Core_Model_1.pt  (YOLO)

Uses YOLO's built-in tracker (BoT-SORT / ByteTrack) via model.track(persist=True)
to assign persistent IDs to detected persons across frames.
"""
from utils.base_detector import BaseDetector

class AutoTrackingDetector(BaseDetector):
    def __init__(self, conf=0.55):
        super().__init__(model_path="yolov8s.pt", conf=conf)

    def track(self, frame):
        """
        Uses YOLO's built-in tracker (persist=True).
        Returns list of (x1, y1, x2, y2, track_id, confidence) for persons.
        """
        tracks = super().track(frame, classes=[0])
        # Format for service: (x1, y1, x2, y2, track_id, confidence)
        return [(t[0], t[1], t[2], t[3], t[4], t[5]) for t in tracks]
