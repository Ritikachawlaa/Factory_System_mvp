import cv2
import time
import os

import logging
from utils import recognition  # Import the shared face recognizer
from .detector import YOLODetector
from .tracker import CentroidTracker
from .identity_cache import IdentityCache
from .logic import IntrusionDetector

# Path to model (Assuming we copy it or reference it?)
# The existing app.py pointed to: MODEL_PATH = os.path.join(BASE_DIR, "models", "Core_Model_1.pt")
# We need to ensure this model exists in backend/models or similar.
# For now, let's assume valid path or placeholder.
MODEL_PATH = "yolov8n.pt" # Default to n if specific not found, or user must provide.

logger = logging.getLogger("intrusion")

class IntrusionService:
    def __init__(self):
        self.detector = None
        self.tracker = CentroidTracker()
        self.cache = IdentityCache()
        
        # Load authorized personnel from DB - TODO: Inject this dependency or pass via config
        # authorized_names = [e[0] for e in database.get_all_employees()] 
        authorized_names = ["Admin", "User1"] # Placeholder to break dependency
        self.intrusion_logic = IntrusionDetector(authorized_names)
        
        self.last_recog_time = {}
        self.model_loaded = False
        
    def load_model(self):
        if not self.model_loaded:
            print("Intrusion: Loading YOLO...")
            try:
                # Todo: Use specific model path from Phase 1 repo if available
                # c:\Users\ritik\Desktop\testing\Ai_system_phase_1_repo\Core_model_1\Core_Model_1.pt
                # Let's try to find it dynamically or hardcode for this user env
                specific_model = r"c:\Users\ritik\Desktop\testing\Ai_system_phase_1_repo\Core_model_1\Core_Model_1.pt"
                if os.path.exists(specific_model):
                    self.detector = YOLODetector(specific_model)
                else:
                    self.detector = YOLODetector(MODEL_PATH) # Fallback
                self.model_loaded = True
                print("Intrusion: YOLO Loaded.")
            except Exception as e:
                print(f"Intrusion: Model Load Failed: {e}")

    def process_frame(self, frame, camera_id=0):
        if not self.model_loaded:
            self.load_model()
            
        if self.detector is None:
            return frame, []
            
        # Detect Persons (Class 0)
        boxes = self.detector.detect(frame)
        objects = self.tracker.update(boxes)
        events = []
        
        for obj_id, (cx, cy) in objects.items():
            # Map object ID back to box?
            # Tracker only returns centroids. We need boxes for face rec crop.
            # Match centroid to nearest box? Or update tracker to store boxes.
            # The simple tracker in source only stored (cx, cy).
            # But the app.py line 107 says: `x1, y1, x2, y2 = boxes[list(objects.keys()).index(obj_id)]`
            # This relies on ordered dicts and strict order preservation which is risky if tracker logic changes.
            # But since tracker creates new IDs every frame in the EXACT order of boxes, it works.
            
            # Find box index? 
            # objects is {0: (cx,cy), 1: ...}
            # boxes is [(x,y,x,y), ...]
            # obj_id 0 corresponds to boxes[0] because of the simple loop in tracker.
            
            if obj_id < len(boxes):
                x1, y1, x2, y2 = boxes[obj_id]
            else:
                continue # Should not happen with that specific tracker logic
            
            # Pad
            pad = 20
            h, w = frame.shape[:2]
            x1 = max(0, x1-pad)
            y1 = max(0, y1-pad)
            x2 = min(w, x2+pad)
            y2 = min(h, y2+pad)
            
            # Face Rec logic
            name = "Detecting..."
            now = time.time()
            last_time = self.last_recog_time.get(obj_id, 0)
            
            # Check Identity Cache
            if obj_id in self.cache.locked:
                name = self.cache.locked[obj_id]
            else:
                # Run Face Rec every 2 seconds
                if now - last_time > 2.0:
                    face_crop = frame[y1:y2, x1:x2]
                    if face_crop.size > 0:
                        # Use shared recognition module
                        # identify_faces returns list of (name, score, box)
                        # We just want the best name in this crop.
                        results = recognition.identify_faces(face_crop)
                        if results:
                            # Pick best
                            best_name = results[0][0] # (name, score, box)
                            name = self.cache.update(obj_id, best_name)
                        else:
                            name = self.cache.update(obj_id, "Unknown")
                    
                    self.last_recog_time[obj_id] = now
            
            # Intrusion Check
            if name != "Detecting...":
                if self.intrusion_logic.check_intrusion(name):
                    # logic return True if NEW alert.
                    # Generate Event
                    # Generate Event
                    event = {
                        "camera_id": camera_id,
                        "module_key": "intrusion",
                        "label": "Unauthorized Entry",
                        "confidence": 1.0, 
                        "meta": f"Person: {name}"
                    }
                    if event not in events:
                        events.append(event)
            
            # Draw
            color = (0, 0, 255) if name == "Unknown" or name not in self.intrusion_logic.authorized else (0, 255, 0)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, name, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
            
        return frame, events

