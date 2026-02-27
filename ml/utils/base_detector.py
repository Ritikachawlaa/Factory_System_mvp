import os
import torch
import logging
from ultralytics import YOLO

logger = logging.getLogger("ml_base_detector")

class BaseDetector:
    """
    Standardized detector for all ML modules.
    Features: GPU support, FP16 half-precision, native Python types, and YOLOv8s default.
    """
    def __init__(self, model_path=None, conf=0.3, task='detect'):
        self.conf = conf
        self.task = task
        
        # Priority 1: User provided path
        # Priority 2: Core_Model_1.pt (if exists locally)
        # Priority 3: yolov8s.pt (Standard Pro model)
        
        _LOCAL_MODEL = os.path.join(os.path.dirname(__file__), "..", "models", "Core_Model_1.pt")
        
        if model_path and os.path.exists(model_path):
            final_path = model_path
        elif os.path.exists(_LOCAL_MODEL):
            final_path = _LOCAL_MODEL
        else:
            # Upgraded from 'n' to 's' for system-wide Pro accuracy
            final_path = "yolov8s.pt" if not model_path else model_path
            
        logger.info(f"Loading BaseDetector with model: {final_path} (conf={conf})")
        self.model = YOLO(final_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        logger.info(f"BaseDetector loaded on {self.device}")

    def detect(self, frame, classes=[0]):
        """
        Detect specified classes (default 0=person).
        Returns list of (x1, y1, x2, y2, confidence, class_id).
        """
        is_gpu = self.device.type == "cuda"
        results = self.model(frame, conf=self.conf, verbose=False, device=self.device, half=is_gpu)[0]
        
        detections = []
        for box in results.boxes:
            cls_id = int(box.cls[0].tolist()) if hasattr(box.cls[0], 'tolist') else int(box.cls[0])
            
            if classes is not None and cls_id not in classes:
                continue
                
            # Convert to native Python types for JSON compatibility
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist() if hasattr(box.xyxy[0], 'tolist') else box.xyxy[0])
            conf = float(box.conf[0].tolist()) if hasattr(box.conf[0], 'tolist') else float(box.conf[0])
            
            detections.append((x1, y1, x2, y2, conf, cls_id))
            
        return detections

    def track(self, frame, classes=[0]):
        """
        Uses YOLO's built-in tracker (persist=True).
        Returns list of (x1, y1, x2, y2, track_id, confidence, class_id).
        """
        is_gpu = self.device.type == "cuda"
        results = self.model.track(frame, persist=True, conf=self.conf, verbose=False, device=self.device, half=is_gpu)[0]
        
        tracks = []
        if results.boxes is not None:
            for box in results.boxes:
                cls_id = int(box.cls[0].tolist()) if hasattr(box.cls[0], 'tolist') else int(box.cls[0])
                if classes is not None and cls_id not in classes:
                    continue
                    
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist() if hasattr(box.xyxy[0], 'tolist') else box.xyxy[0])
                track_id = int(box.id[0].tolist()) if box.id is not None else -1
                conf = float(box.conf[0].tolist()) if hasattr(box.conf[0], 'tolist') else float(box.conf[0])
                
                tracks.append((x1, y1, x2, y2, track_id, conf, cls_id))
                
        return tracks
