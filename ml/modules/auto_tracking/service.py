"""
Auto Tracking – Service
Persistently tracks persons across frames using YOLO's BoT-SORT tracker.
Emits events for new tracks appearing or tracks being lost.
"""
import cv2
import time
import logging
from .detector import AutoTrackingDetector

logger = logging.getLogger("auto_tracking")


class AutoTrackingService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.known_ids = set()
        self.last_log_time = 0
        self.LOG_INTERVAL = 5

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading Auto Tracking model …")
            try:
                self.detector = AutoTrackingDetector(conf=0.4)
                self.model_loaded = True
                logger.info("Auto Tracking model loaded.")
            except Exception as e:
                logger.error(f"Auto Tracking model load failed: {e}")

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, []

        tracks = self.detector.track(frame)
        events = []
        current_ids = set()

        for (x1, y1, x2, y2, track_id, conf) in tracks:
            current_ids.add(track_id)

            # Draw tracked box with ID (same style as ai_camera_system.py:49-51)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, f"ID {track_id}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        cv2.putText(frame, f"Tracking: {len(tracks)}", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        # Detect new tracks
        now = time.time()
        new_ids = current_ids - self.known_ids
        lost_ids = self.known_ids - current_ids

        if new_ids and now - self.last_log_time > self.LOG_INTERVAL:
            events.append({
                "camera_id": camera_id,
                "module_key": "auto_tracking",
                "label": "New Track(s)",
                "confidence": 1.0,
                "timestamp": now,
                "meta": f"New IDs: {list(new_ids)}, Active: {len(current_ids)}"
            })
            self.last_log_time = now

        if lost_ids and now - self.last_log_time > self.LOG_INTERVAL:
            events.append({
                "camera_id": camera_id,
                "module_key": "auto_tracking",
                "label": "Track(s) Lost",
                "confidence": 1.0,
                "timestamp": now,
                "meta": f"Lost IDs: {list(lost_ids)}, Active: {len(current_ids)}"
            })
            self.last_log_time = now

        self.known_ids = current_ids
        return frame, events
