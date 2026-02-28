"""
Face Detection – Detector
Source: Ai_system_phase_1_repo/AI_FACE_DASHBOARD_FINAL/register_dashboard/app.py
Uses OpenCV Haar Cascade (haarcascade_frontalface_default.xml) — no GPU needed.
"""
import os
import torch
from ultralytics import YOLO
import logging

logger = logging.getLogger("face_detection")

from utils.base_detector import BaseDetector

class FaceDetector(BaseDetector):
    def __init__(self, conf=0.4):
        # Using Core_Model_1.pt (verified as high-accuracy face model)
        super().__init__(model_path="Core_Model_1.pt", conf=conf)
        logger.info(f"YOLO-Face Detector initialized with Core_Model_1.pt")

    def detect(self, frame):
        """Return list of (x, y, w, h, confidence) face rectangles."""
        # Reverting to standard resolution (640 or model default) for reliability
        detections = super().detect(frame, classes=[0])
        # Format for face service: (x, y, w, h, confidence)
        return [(d[0], d[1], d[2]-d[0], d[3]-d[1], d[4]) for d in detections]
