"""
Face Detection – Detector
Uses YOLO Core_Model_1.pt for robust accuracy.
Optimized for multi-face detection (iou=0.5, max_det=100) and reduced delay (imgsz=320).
"""
import os
import torch
from ultralytics import YOLO
import logging

logger = logging.getLogger("face_detection")

from utils.base_detector import BaseDetector

class FaceDetector(BaseDetector):
    def __init__(self, conf=0.25):
        # Revert to robust YOLO Face Model
        super().__init__(model_path="Core_Model_1.pt", conf=conf)
        logger.info(f"YOLO-Face Detector initialized with Core_Model_1.pt")

    def detect(self, frame):
        """Return list of (x, y, w, h, confidence) face rectangles."""
        is_gpu = self.device.type == "cuda"
        
        # Optimizations: 
        # imgsz=320 for speed
        # iou=0.5 to allow boxes for faces close together
        # max_det=100 explicitly allowing up to 100 people at once
        results = self.model(
            frame, 
            conf=self.conf, 
            iou=0.5,
            max_det=100,
            verbose=False, 
            device=self.device, 
            half=is_gpu, 
            imgsz=320
        )[0]
        
        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            conf = float(box.conf[0].tolist())
            detections.append((x1, y1, x2 - x1, y2 - y1, conf))
            
        return detections
