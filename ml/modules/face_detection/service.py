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
        # detection: (x, y, w, h, conf)
        faces = self.detector.detect(frame)
        count = len(faces)
        events = []
        boxes = []

        # Draw rectangles
        for (x, y, w, h, conf) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 255), 2)
            label = f"Face: {conf:.2f}"
            cv2.putText(frame, label, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 255), 2)
            boxes.append({
                "class": "Face",
                "x": int(x), "y": int(y), "w": int(w), "h": int(h), 
                "confidence": float(conf)
            })

        cv2.putText(frame, f"Faces: {count}", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 255), 2)

        # Event logic
        now = time.time()
        changed = abs(count - self.last_count) >= 1
        timed = now - self.last_log_time > self.LOG_INTERVAL

        if count > 0 and (changed or timed):
            max_conf = max((f[4] for f in faces), default=0.0)
            events.append({
                "camera_id": camera_id,
                "module_key": "face-detection",
                "label": "Face Detected",
                "confidence": float(max_conf),
                "timestamp": now,
                "meta": f"Faces: {count}"
            })
            self.last_count = count
            self.last_log_time = now

        return frame, events, boxes
