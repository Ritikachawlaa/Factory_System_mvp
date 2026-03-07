"""
Human Detection – Detector
Source: Ai_system_phase_1_repo/Core_model_1/ai_camera_system.py
Model : Core_Model_1.pt  (YOLO – class 0 = person)
"""
import os
from ultralytics import YOLO

import torch

from utils.base_detector import BaseDetector

class HumanDetector(BaseDetector):
    def __init__(self, conf=0.55):
        super().__init__(model_path="yolov8n.pt", conf=conf)

    def detect(self, frame):
        """Return list of (x1, y1, x2, y2, confidence) for every person."""
        detections = super().detect(frame, classes=[0])
        # Format for service: list of (x1, y1, x2, y2, confidence)
        return [(d[0], d[1], d[2], d[3], d[4]) for d in detections]
