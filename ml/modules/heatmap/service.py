import cv2
import os
import logging
from .detector import HeatmapDetector
from .engine import HeatmapEngine

MODEL_PATH = "yolov8n.pt" 
logger = logging.getLogger("heatmap")

class HeatmapService:
    def __init__(self):
        self.detector = None
        self.engine = None
        self.model_loaded = False
        
    def load_model(self):
        if not self.model_loaded:
            print("Heatmap: Loading YOLO...")
            try:
                specific_model = r"c:\Users\ritik\Desktop\testing\Ai_system_phase_1_repo\Core_model_1\Core_Model_1.pt"
                if os.path.exists(specific_model):
                    self.detector = HeatmapDetector(specific_model)
                else:
                    self.detector = HeatmapDetector(MODEL_PATH)
                self.model_loaded = True
                print("Heatmap: YOLO Loaded.")
            except Exception as e:
                print(f"Heatmap: Model Load Failed: {e}")

    def process_frame(self, frame, camera_id=0):
        if not self.model_loaded:
            self.load_model()
            
        h, w = frame.shape[:2]
        if self.engine is None or self.engine.width != w or self.engine.height != h:
            self.engine = HeatmapEngine(w, h)
            
        if self.detector is None:
            return frame, []
            
        boxes = self.detector.detect(frame)
        self.engine.update_bbox(boxes)
        
        heatmap_img = self.engine.render()
        
        bounding_boxes = []
        for (x1, y1, x2, y2) in boxes:
            bounding_boxes.append({
                "class": "Person",
                "x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1), "confidence": 1.0
            })
            
        return overlay, [], bounding_boxes
