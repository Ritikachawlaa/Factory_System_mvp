"""
Object Detection – Detector
Detects a wide variety of common objects (COCO classes).
Based on the proven Object_Abandon reference pattern.
"""
from ultralytics import YOLO
import os
import logging

logger = logging.getLogger("object_detection")

# COCO classes we care about for "Object Detection" in factory/security context
ALLOWED_CLASSES = [
    "person", "bicycle", "car", "motorcycle", "bus", "truck",
    "backpack", "umbrella", "handbag", "suitcase",
    "bottle", "cup", "fork", "knife", "spoon",
    "chair", "couch", "potted plant",
    "bed", "dining table", "toilet",
    "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
    "microwave", "oven", "toaster", "refrigerator",
    "book", "clock", "vase", "scissors",
    "teddy bear", "hair drier", "toothbrush",
    "box", "shopping cart"
]

CONFIDENCE_THRESHOLD = 0.4

class ObjectDetector:
    def __init__(self):
        # Use yolov8n.pt (Nano) for speed — tracker compensates for accuracy
        _MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
        model_path = os.path.join(_MODELS_DIR, "yolov8n.pt")
        
        if not os.path.exists(model_path):
            model_path = "yolov8n.pt"  # Ultralytics will auto-download
            
        logger.info(f"ObjectDetector loading model: {model_path}")
        self.model = YOLO(model_path)
        self.names = self.model.names
        logger.info(f"ObjectDetector loaded. Available classes: {len(self.names)}")

    def detect(self, frame):
        """
        Detect objects. Tries tracker first, falls back to plain detection.
        Returns list of dicts with class, bbox, confidence, track_id.
        """
        track_id_map = {}
        
        # Try tracking first for persistent IDs
        try:
            results = self.model.track(
                frame, 
                conf=CONFIDENCE_THRESHOLD, 
                persist=True, 
                verbose=False
            )[0]
            
            # If tracker returned nothing, fall back
            if results.boxes is None or len(results.boxes) == 0:
                raise ValueError("Tracker returned no results")
                
            # Build track_id map
            if results.boxes.id is not None:
                for i, box in enumerate(results.boxes):
                    track_id_map[i] = int(box.id[0]) if box.id is not None else None
                    
        except Exception as e:
            logger.debug(f"Tracker fallback to plain detection: {e}")
            # Fallback: plain detection (no tracking IDs but always works)
            results = self.model(
                frame, 
                conf=CONFIDENCE_THRESHOLD, 
                verbose=False
            )[0]
        
        detections = []
        if results.boxes is not None:
            for i, box in enumerate(results.boxes):
                cls_id = int(box.cls[0])
                cls_name = self.names.get(cls_id, "object")
                conf = float(box.conf[0])
                
                # Only keep allowed classes
                if cls_name not in ALLOWED_CLASSES:
                    continue
                
                # Get tracking ID if available
                track_id = track_id_map.get(i)
                if track_id is None and box.id is not None:
                    track_id = int(box.id[0])
                    
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                
                detections.append({
                    "class": cls_name,
                    "bbox": (x1, y1, x2, y2),
                    "confidence": conf,
                    "track_id": track_id
                })
        
        return detections
