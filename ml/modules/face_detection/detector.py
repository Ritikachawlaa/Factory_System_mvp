"""
Face Detection – Detector
Source: Ai_system_phase_1_repo/AI_FACE_DASHBOARD_FINAL/register_dashboard/app.py
Uses OpenCV Haar Cascade (haarcascade_frontalface_default.xml) — no GPU needed.
"""
import os
import cv2
import logging

logger = logging.getLogger("face_detection")

class FaceDetector:
    def __init__(self, scale_factor=1.3, min_neighbors=5, min_size=(30, 30), conf=0.4):
        # We accept `conf` for interface compatibility with BaseDetector if needed
        self.cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.cascade = cv2.CascadeClassifier(self.cascade_path)
        
        if self.cascade.empty():
            logger.error(f"Failed to load Haar cascade from {self.cascade_path}")
        else:
            logger.info("FaceDetector initialized with Haar Cascades (Fast Multi-Face CPU)")
            
        self.scale_factor = scale_factor
        self.min_neighbors = min_neighbors
        self.min_size = min_size

    def detect(self, frame):
        """Return list of (x, y, w, h, confidence) face rectangles."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # detectMultiScale3 provides weights which we can proxy as confidence
        faces, rejectLevels, levelWeights = self.cascade.detectMultiScale3(
            gray,
            scaleFactor=self.scale_factor,
            minNeighbors=self.min_neighbors,
            minSize=self.min_size,
            outputRejectLevels=True
        )
        
        if len(faces) == 0:
            return []
            
        detections = []
        for (x, y, w, h), weight in zip(faces, levelWeights):
            # Normalize Haar weight (often 1-10+) to a 0.5 - 0.99 confidence score
            conf = min(0.99, max(0.4, float(weight) / 10.0))
            detections.append((int(x), int(y), int(w), int(h), conf))
            
        return detections
