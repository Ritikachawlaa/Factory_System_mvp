"""
Object Removal – Service
Detects if an object is removed, and whether a person was nearby (Normal vs Suspicious).
"""
import time
import cv2
import logging
from .detector import RemovalDetector

logger = logging.getLogger("object_removal")

class ObjectRemovalService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.registry = {} # obj_id -> {last_seen, person_nearby, status}
        self.N_FRAMES_MISSING = 30
        self.last_log_time = 0

    def _load(self):
        if not self.model_loaded:
            try:
                self.detector = RemovalDetector(conf=0.4)
                self.model_loaded = True
                logger.info("Object Removal model loaded.")
            except Exception as e:
                logger.error(f"Object Removal model load failed: {e}")

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, []

        detections = self.detector.detect_all(frame)
        persons = [d for d in detections if d[5] == 0]
        objects = [d for d in detections if d[5] != 0]
        
        current_visible_keys = set()
        events = []
        bounding_boxes = []
        now = time.time()

        # Update registry with currently visible objects
        for obj in objects:
            x1, y1, x2, y2, conf, cls_id = obj
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            obj_key = f"{cls_id}_{cx // 20}_{cy // 20}"
            current_visible_keys.add(obj_key)

            person_nearby = False
            for p in persons:
                px1, py1, px2, py2, _, _ = p
                # Check if person overlaps or is very close
                if not (px2 < x1 or px1 > x2 or py2 < y1 or py1 > y2):
                    person_nearby = True
                    break
            
            if obj_key not in self.registry:
                self.registry[obj_key] = {
                    "first_seen": now,
                    "last_seen": now,
                    "person_nearby_last": person_nearby,
                    "missing_count": 0,
                    "label": self.detector.model.names[cls_id]
                }
            else:
                self.registry[obj_key]["last_seen"] = now
                self.registry[obj_key]["person_nearby_last"] = person_nearby
                self.registry[obj_key]["missing_count"] = 0

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
            cv2.putText(frame, self.registry[obj_key]["label"], (x1, y1-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
            
            bounding_boxes.append({
                "class": self.registry[obj_key]["label"],
                "x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1), "confidence": conf
            })

        # Check for missing objects
        for obj_key, data in list(self.registry.items()):
            if obj_key not in current_visible_keys:
                data["missing_count"] += 1
                
                if data["missing_count"] > self.N_FRAMES_MISSING:
                    # Object removed!
                    removal_type = "Normal" if data["person_nearby_last"] else "Suspicious"
                    logger.warning(f"Object {data['label']} removed: {removal_type}")
                    
                    events.append({
                        "camera_id": camera_id,
                        "module_key": "object-removal",
                        "label": f"{removal_type} Removal",
                        "confidence": 1.0,
                        "timestamp": now,
                        "meta": f"Object {data['label']} removed. Suspicious: {not data['person_nearby_last']}"
                    })
                    
                    del self.registry[obj_key]
            else:
                data["missing_count"] = 0

        return frame, events, bounding_boxes
