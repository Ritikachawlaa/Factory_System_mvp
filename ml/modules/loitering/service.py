import cv2
import os
import logging
# import database
from .detector import PersonDetector
from .logic import CrowdLoitering

# Path to model (Assuming shared or specific)
MODEL_PATH = "yolov8n.pt" 

logger = logging.getLogger("loitering")

class LoiteringService:
    def __init__(self):
        self.detector = None
        self.loitering_logic = CrowdLoitering()
        self.model_loaded = False
        
        # Default config (should be overridable via update_config)
        self.person_threshold = 3
        self.time_threshold = 10 # seconds (lowered for testing)
        
    def load_model(self):
        if not self.model_loaded:
            print("Loitering: Loading YOLO...")
            try:
                # Try to use same model as intrusion if available
                specific_model = r"c:\Users\ritik\Desktop\testing\Ai_system_phase_1_repo\Core_model_1\Core_Model_1.pt"
                if os.path.exists(specific_model):
                    self.detector = PersonDetector(specific_model)
                else:
                    self.detector = PersonDetector(MODEL_PATH)
                self.model_loaded = True
                print("Loitering: YOLO Loaded.")
            except Exception as e:
                print(f"Loitering: Model Load Failed: {e}")

    def update_config(self, config):
        if 'threshold' in config:
            self.person_threshold = int(config['threshold'])
        if 'time_limit' in config:
            self.time_threshold = int(config['time_limit'])
            
    def process_frame(self, frame, camera_id=0):
        if not self.model_loaded:
            self.load_model()
            
        if self.detector is None:
            return frame, []
            
        # Detect
        boxes = self.detector.detect(frame)
        person_count = len(boxes)
        
        # Logic
        alert, duration = self.loitering_logic.update(person_count, self.person_threshold, self.time_threshold)
        
        events = []
        # Alert Generation
        if alert:
             # De-duplicate alerts? 
             # Logic return true every frame while active.
             # We should probably only log once every X seconds or if state changed.
             # existing app.py prints error every frame.
             # We will log to DB (which might spam events table if not throttled).
             # Let's throttle detection logging.
             # For now, simplistic logging.
             
             event = {
                "camera_id": camera_id,
                "module_key": "loitering",
                "label": "Crowd Loitering",
                "confidence": 1.0,
                "meta": f"Count: {person_count}, Duration: {int(duration)}s"
             }
             events.append(event)
        
        # Draw
        for (x1, y1, x2, y2) in boxes:
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 0), 2)
            
        # Overlay
        cv2.putText(frame, f"Count: {person_count}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
        if alert:
            cv2.putText(frame, f"LOITERING ({int(duration)}s)", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
            
        return frame, events
