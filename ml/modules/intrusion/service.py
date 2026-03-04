import cv2
import time
import os

import logging
from utils import recognition  # Import the shared face recognizer
from .detector import YOLODetector
from modules.line_crossing.tracker import CentroidTracker
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
        self.tracker = CentroidTracker(max_distance=50)
        self.cache = IdentityCache()
        
        # Load authorized personnel from DB - TODO: Inject this dependency or pass via config
        # authorized_names = [e[0] for e in database.get_all_employees()] 
        authorized_names = ["Admin", "User1"] # Placeholder to break dependency
        self.intrusion_logic = IntrusionDetector(authorized_names)
        
        self.last_recog_time = {}
        self.model_loaded = False

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
        track_boxes = self._match_tracks_to_boxes(boxes, objects)
        events = []
        bounding_boxes = []
        
        for obj_id, (x1, y1, x2, y2) in track_boxes.items():
            pad = 20
            h, w = frame.shape[:2]
            x1 = max(0, x1-pad)
            y1 = max(0, y1-pad)
            x2 = min(w, x2+pad)
            y2 = min(h, y2+pad)

            name = "Detecting..."
            now = time.time()
            last_time = self.last_recog_time.get(obj_id, 0)

            if obj_id in self.cache.locked:
                name = self.cache.locked[obj_id]
            else:
                if now - last_time > 2.0:
                    face_crop = frame[y1:y2, x1:x2]
                    if face_crop.size > 0:
                        results = recognition.identify_faces(face_crop)
                        if results:
                            best_name, emp_id, score, box = results[0]
                            display_name = f"{best_name} (ID: {emp_id})" if emp_id else best_name
                            name = self.cache.update(obj_id, display_name)
                        else:
                            name = self.cache.update(obj_id, "Unknown")
                    
                    self.last_recog_time[obj_id] = now
            
            base_name = name.split(" (ID:")[0].strip() if name else "Unknown"

            if name != "Detecting...":
                if self.intrusion_logic.check_intrusion(base_name):
                    event = {
                        "camera_id": camera_id,
                        "module_key": "intrusion-detection",
                        "label": f"Unauthorized Entry (ID #{obj_id})",
                        "confidence": 1.0, 
                        "meta": f"Track ID: {obj_id}, Person: {name}"
                    }
                    if event not in events:
                        events.append(event)

            is_unauthorized = base_name == "Unknown" or base_name not in self.intrusion_logic.authorized
            color = (0, 0, 255) if is_unauthorized else (0, 255, 0)
            label = f"{name} [ID {obj_id}]"
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

            bounding_boxes.append({
                "class": name if name != "Unknown" else "Unauthorized",
                "track_id": int(obj_id),
                "x": int(x1),
                "y": int(y1),
                "w": int(x2 - x1),
                "h": int(y2 - y1),
                "confidence": 1.0
            })
            
        return frame, events, bounding_boxes

