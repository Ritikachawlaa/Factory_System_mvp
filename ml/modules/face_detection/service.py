"""
Face Detection – Service
Detects faces in each frame and emits events when faces are found.
"""
import cv2
import time
import logging
from .detector import FaceDetector

logger = logging.getLogger("face_detection")


class FaceDetectionService:
    def __init__(self):
        self.detector = FaceDetector()
        self.last_count = 0
        self.last_log_time = 0
        self.LOG_INTERVAL = 5

    def process_frame(self, frame, camera_id=0):
        faces = self.detector.detect(frame)
        count = len(faces)
        events = []

        # Draw rectangles
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 255), 2)
            cv2.putText(frame, "Face", (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 255), 2)

        cv2.putText(frame, f"Faces: {count}", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 255), 2)

        # Event logic
        now = time.time()
        changed = abs(count - self.last_count) >= 1
        timed = now - self.last_log_time > self.LOG_INTERVAL

        if count > 0 and (changed or timed):
            events.append({
                "camera_id": camera_id,
                "module_key": "face_detection",
                "label": "Face Detected",
                "confidence": 1.0,
                "timestamp": now,
                "meta": f"Faces: {count}"
            })
            self.last_count = count
            self.last_log_time = now

        return frame, events
