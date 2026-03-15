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
        self.roi = None # [x1, y1, x2, y2]
        self.last_log_time = 0

    def update_config(self, config):
        """Called by run_ml.py when DB config changes."""
        if 'roi' in config:
            self.roi = config['roi'] # Expecting [x1, y1, x2, y2]
        if 'authorized_personnel' in config:
            self.intrusion_logic.authorized = set(config['authorized_personnel'])

    def is_in_roi(self, box):
        if self.roi is None:
            return True # If no ROI, entire frame is sensitive
        bx1, by1, bx2, by2 = box
        rx1, ry1, rx2, ry2 = self.roi
        # Check if centroid is in ROI
        cx, cy = (bx1 + bx2) / 2, (by1 + by2) / 2
        return rx1 <= cx <= rx2 and ry1 <= cy <= ry2

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
            return frame, [], []
            
        boxes = self.detector.detect(frame)
        objects = self.tracker.update(boxes)
        track_boxes = self._match_tracks_to_boxes(boxes, objects)
        events = []
        bounding_boxes = []
        
        now = time.time()

        # Draw ROI if exists
        if self.roi:
            rx1, ry1, rx2, ry2 = self.roi
            cv2.rectangle(frame, (rx1, ry1), (rx2, ry2), (255, 0, 0), 2)
            cv2.putText(frame, "Intrusion Zone", (rx1, ry1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)

        for obj_id, (x1, y1, x2, y2) in track_boxes.items():
            # Check if this person is in the ROI
            in_zone = self.is_in_roi((x1, y1, x2, y2))
            
            pad = 20
            h, w = frame.shape[:2]
            cx1 = max(0, x1-pad)
            cy1 = max(0, y1-pad)
            cx2 = min(w, x2+pad)
            cy2 = min(h, y2+pad)

            name = "Detecting..."
            last_time = self.last_recog_time.get(obj_id, 0)

            if obj_id in self.cache.locked:
                name = self.cache.locked[obj_id]
            else:
                if now - last_time > 2.0:
                    face_crop = frame[cy1:cy2, cx1:cx2]
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
            
            # Logic: If they are in the zone AND (Unauthorized OR still Detecting...)
            is_unauthorized = (base_name == "Unknown" or base_name not in self.intrusion_logic.authorized)
            
            # Allow a small grace period for "Detecting..." before flagging
            is_intruding = in_zone and (is_unauthorized or (name == "Detecting..." and now - self.last_recog_time.get(obj_id, now) > 3.0))

            if is_intruding:
                if now - self.last_log_time > 5.0:
                    msg = f"Unauthorized person in zone: {name}" if is_unauthorized else "Unidentified person in zone"
                    event = {
                        "camera_id": camera_id,
                        "module_key": "intrusion-detection",
                        "label": "Unauthorized Entry",
                        "confidence": 1.0, 
                        "timestamp": now,
                        "meta": {
                            "message": msg,
                            "track_id": int(obj_id),
                            "person": name,
                            "zone": self.roi
                        }
                    }
                    events.append(event)
                    self.last_log_time = now

            color = (0, 0, 255) if is_intruding else (0, 255, 0)
            label = f"{name} [ID {obj_id}]"
            if is_intruding: label += " !! INTRUSION !!"
            
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            bounding_boxes.append({
                "class": "Unauthorized" if is_intruding else "Authorized",
                "label": label,
                "track_id": int(obj_id),
                "x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1),
                "confidence": 1.0,
                "color": "#ef4444" if is_intruding else "#10b981"
            })
            
        return frame, events, bounding_boxes

