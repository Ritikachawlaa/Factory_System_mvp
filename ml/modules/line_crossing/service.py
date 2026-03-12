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
        self.tracker = CentroidTracker(max_distance=250, max_disappeared=30)
        self.model_loaded = False
        
        self.prev_centroids = {} # id -> (cx, cy)
        
        # Config
        self.line_x = 320 # Default to middle of 640p
        self.count_l2r = 0
        self.count_r2l = 0

    def _match_tracks_to_boxes(self, boxes, tracked_objects):
        centroids = []
        for (x1, y1, x2, y2) in boxes:
            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)
            centroids.append((cx, cy, (x1, y1, x2, y2)))

        used_indices = set()
        track_boxes = {}

        for track_id, (cx, cy) in tracked_objects.items():
            best_idx = None
            best_dist = float("inf")
            for idx, (bx, by, box) in enumerate(centroids):
                if idx in used_indices:
                    continue
                dist = (cx - bx) ** 2 + (cy - by) ** 2
                if dist < best_dist:
                    best_dist = dist
                    best_idx = idx

            if best_idx is not None:
                used_indices.add(best_idx)
                track_boxes[track_id] = centroids[best_idx][2]

        return track_boxes
        
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
        if 'line_x' in config:
            self.line_x = int(config['line_x'])
            
    def process_frame(self, frame, camera_id=0):
        if not self.model_loaded:
            self.load_model()
            
        if self.detector is None:
            return frame, []
            
        # Detect
        boxes = self.detector.detect(frame)
        
        # Track
        objects = self.tracker.update(boxes)
        track_boxes = self._match_tracks_to_boxes(boxes, objects)
        
        current_centroids = objects
        events = []
        bounding_boxes = []
        
        # Check crossings
        for obj_id, (cx, cy) in current_centroids.items():
            if obj_id in self.prev_centroids:
                prev_cx, prev_cy = self.prev_centroids[obj_id]
                
                status = crossed_line(prev_cx, cx, self.line_x)
                
                if status:
                    if status == "LEFT_TO_RIGHT":
                        self.count_l2r += 1
                        label = f"Line Cross L->R (ID #{obj_id})"
                    else:
                        self.count_r2l += 1
                        label = f"Line Cross R->L (ID #{obj_id})"
                        
                    # Log Event
                    event = {
                        "camera_id": camera_id,
                        "module_key": "line-crossing",
                        "label": label,
                        "confidence": 1.0,
                        "meta": f"Track ID: {obj_id}, Direction: {status}, Total: L->R={self.count_l2r}, R->L={self.count_r2l}"
                    }
                    events.append(event)
        
        # Update state
        self.prev_centroids = current_centroids.copy()
        
        # Draw Line
        h, w = frame.shape[:2]
        cv2.line(frame, (self.line_x, 0), (self.line_x, h), (0, 0, 255), 2)
        
        # Draw Boxes & IDs
        for obj_id, (x1, y1, x2, y2) in track_boxes.items():
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(frame, f"ID {obj_id}", (x1, max(20, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
            bounding_boxes.append({
                "class": "Person",
                "track_id": int(obj_id),
                "x": int(x1),
                "y": int(y1),
                "w": int(x2 - x1),
                "h": int(y2 - y1),
                "confidence": 1.0
            })
            
        for obj_id, (cx, cy) in current_centroids.items():
             cv2.circle(frame, (cx, cy), 4, (0, 255, 0), -1)
             cv2.putText(frame, f"T{obj_id}", (cx - 10, cy - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Overlay Stats
        cv2.putText(frame, f"L->R: {self.count_l2r} R->L: {self.count_r2l}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            
        return frame, events, bounding_boxes
