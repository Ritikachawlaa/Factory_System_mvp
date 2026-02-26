"""
Face Detection – Detector
Source: Ai_system_phase_1_repo/AI_FACE_DASHBOARD_FINAL/register_dashboard/app.py
Uses OpenCV Haar Cascade (haarcascade_frontalface_default.xml) — no GPU needed.
"""
import cv2


class FaceDetector:
    def __init__(self, scale_factor=1.1, min_neighbors=4, min_size=(30, 30)):
        self.cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        self.scale_factor = scale_factor
        self.min_neighbors = min_neighbors
        self.min_size = min_size

    def detect(self, frame):
        """Return list of (x, y, w, h) face rectangles."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.cascade.detectMultiScale(
            gray,
            scaleFactor=self.scale_factor,
            minNeighbors=self.min_neighbors,
            minSize=self.min_size
        )
        # detectMultiScale returns ndarray or empty tuple
        if len(faces) == 0:
            return []
        return [(int(x), int(y), int(w), int(h)) for (x, y, w, h) in faces]
