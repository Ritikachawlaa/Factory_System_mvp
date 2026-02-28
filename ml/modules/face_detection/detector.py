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
        # Using imgsz=416 for balanced speed and recognition accuracy
        is_gpu = self.device.type == "cuda"
        results = self.model(frame, conf=self.conf, verbose=False, device=self.device, half=is_gpu, imgsz=416)[0]
        
        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            conf = float(box.conf[0].tolist())
            detections.append((x1, y1, x2 - x1, y2 - y1, conf))
            
        return detections
