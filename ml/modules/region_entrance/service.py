import cv2
import os
import time
import logging
# import database
# import database
from utils import recognition
from .detector import RegionDetector
# Use line_crossing/tracker for CentroidTracker as they are similar enough
# Or duplicate to be safe. Let's use the robust one from line_crossing.
# Use line_crossing/tracker for CentroidTracker as they are similar enough
# Or duplicate to be safe. Let's use the robust one from line_crossing.
from modules.line_crossing.tracker import CentroidTracker
from .presence_cache import PresenceManager

MODEL_PATH = "yolov8n.pt" 
logger = logging.getLogger("region_entrance")

class RegionEntranceService:
    def __init__(self):
        self.detector = None
        self.tracker = CentroidTracker(max_distance=50)
        self.presence = PresenceManager(confirm_frames=3, exit_delay=10) # 10s exit for faster testing
        self.model_loaded = False
        self.last_recog_time = {}
        
    def load_model(self):
        if not self.model_loaded:
            print("RegionEntrance: Loading YOLO...")
            try:
                specific_model = r"c:\Users\ritik\Desktop\testing\Ai_system_phase_1_repo\Core_model_1\Core_Model_1.pt"
                if os.path.exists(specific_model):
                    self.detector = RegionDetector(specific_model)
                else:
                    self.detector = RegionDetector(MODEL_PATH)
                self.model_loaded = True
                print("RegionEntrance: YOLO Loaded.")
            except Exception as e:
                print(f"RegionEntrance: Model Load Failed: {e}")

    def process_frame(self, frame, camera_id=0):
        if not self.model_loaded:
            self.load_model()
            
        if self.detector is None:
            return frame, []
            
        boxes = self.detector.detect(frame)
        objects = self.tracker.update(boxes)
        
        events = []
        
        for obj_id, (cx, cy) in objects.items():
            # Find closest box
            # Naive mapping again
            matched_box = None
            min_dist = float('inf')
            
            for (x1, y1, x2, y2) in boxes:
                 bcx = (x1+x2)//2
                 bcy = (y1+y2)//2
                 dist = ((cx-bcx)**2 + (cy-bcy)**2)**0.5
                 if dist < min_dist:
                     min_dist = dist
                     matched_box = (x1, y1, x2, y2)
            
            if matched_box:
                x1, y1, x2, y2 = matched_box
                face_crop = frame[y1:y2, x1:x2]
                
                if obj_id not in self.presence.locked:
                    now = time.time()
                    last_time = self.last_recog_time.get(obj_id, 0)
                    
                    if now - last_time > 1.0 and face_crop.size > 0:
                        results = recognition.identify_faces(face_crop)
                        if results:
                            best_name = results[0][0]
                            name, event = self.presence.update_identity(obj_id, best_name, camera_id)
                        else:
                            name, event = self.presence.update_identity(obj_id, "Unknown", camera_id)
                        
                        if event:
                            events.append(event)
                            
                        self.last_recog_time[obj_id] = now
                    else:
                        name = "Detecting..."
                else:
                    # Locked
                    name = self.presence.locked[obj_id]
                    self.presence.seen(obj_id)
                    
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, name, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                
        # Check Exits
        exit_events = self.presence.check_exit(camera_id)
        if exit_events:
            events.extend(exit_events)
        
        return frame, events
