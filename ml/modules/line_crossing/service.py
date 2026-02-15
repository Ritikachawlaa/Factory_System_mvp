import cv2
import os
import logging
# import database
from .detector import PersonDetector
from .tracker import CentroidTracker
from .logic import crossed_line

# Path to model
MODEL_PATH = "yolov8n.pt" 

logger = logging.getLogger("line_crossing")

class LineCrossingService:
    def __init__(self):
        self.detector = None
        self.tracker = CentroidTracker(max_distance=50)
        self.model_loaded = False
        
        self.prev_centroids = {} # id -> (cx, cy)
        
        # Config
        self.line_y = 240 # Default to middle of 480p
        self.count_up = 0
        self.count_down = 0
        
    def load_model(self):
        if not self.model_loaded:
            print("LineCrossing: Loading YOLO...")
            try:
                specific_model = r"c:\Users\ritik\Desktop\testing\Ai_system_phase_1_repo\Core_model_1\Core_Model_1.pt"
                if os.path.exists(specific_model):
                    self.detector = PersonDetector(specific_model)
                else:
                    self.detector = PersonDetector(MODEL_PATH)
                self.model_loaded = True
                print("LineCrossing: YOLO Loaded.")
            except Exception as e:
                print(f"LineCrossing: Model Load Failed: {e}")

    def update_config(self, config):
        if 'line_y' in config:
            self.line_y = int(config['line_y'])
            
    def process_frame(self, frame, camera_id=0):
        if not self.model_loaded:
            self.load_model()
            
        if self.detector is None:
            return frame, []
            
        # Detect
        boxes = self.detector.detect(frame)
        
        # Track
        objects = self.tracker.update(boxes)
        
        current_centroids = objects
        events = []
        
        # Check crossings
        for obj_id, (cx, cy) in current_centroids.items():
            if obj_id in self.prev_centroids:
                prev_cx, prev_cy = self.prev_centroids[obj_id]
                
                status = crossed_line(prev_cy, cy, self.line_y)
                
                if status:
                    if status == "UP_TO_DOWN":
                        self.count_down += 1
                        label = "Line Cross (Down)"
                    else:
                        self.count_up += 1
                        label = "Line Cross (Up)"
                        
                    # Log Event
                    event = {
                        "camera_id": camera_id,
                        "module_key": "line_crossing",
                        "label": label,
                        "confidence": 1.0,
                        "meta": f"Total: Up={self.count_up}, Down={self.count_down}"
                    }
                    events.append(event)
        
        # Update state
        self.prev_centroids = current_centroids.copy()
        
        # Draw Line
        h, w = frame.shape[:2]
        cv2.line(frame, (0, self.line_y), (w, self.line_y), (0, 0, 255), 2)
        
        # Draw Boxes & IDs
        for (x1, y1, x2, y2) in boxes:
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            
        for obj_id, (cx, cy) in current_centroids.items():
             cv2.circle(frame, (cx, cy), 4, (0, 255, 0), -1)
             cv2.putText(frame, f"ID {obj_id}", (cx - 10, cy - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Overlay Stats
        cv2.putText(frame, f"Up: {self.count_up} Down: {self.count_down}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            
        return frame, events
