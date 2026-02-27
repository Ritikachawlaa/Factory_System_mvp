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

class FaceDetector:
    def __init__(self, conf=0.4):
        logger.info(f"Initializing YOLO-Face Detector... (conf={conf})")
        # Using yolov8n-face for high-speed, high-accuracy face detection
        self.model = YOLO("yolov8n-face.pt") 
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.conf = conf
        logger.info(f"YOLO-Face loaded on {self.device}")

    def detect(self, frame):
        """Return list of (x, y, w, h, confidence) face rectangles."""
        is_gpu = self.device.type == "cuda"
        results = self.model(frame, conf=self.conf, verbose=False, device=self.device, half=is_gpu)[0]
        
        detections = []
        for box in results.boxes:
            # YOLO returns [x1, y1, x2, y2]
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            conf = float(box.conf[0].tolist())
            w = x2 - x1
            h = y2 - y1
            detections.append((x1, y1, w, h, conf))
            
        return detections
