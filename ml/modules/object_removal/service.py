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
            return frame, [], []

        detected_objects = self.detector.detect_all(frame)
        persons = [d for d in detected_objects if d[5] == 0]
        objects = [d for d in detected_objects if d[5] != 0]

        rects = [(d[0], d[1], d[2], d[3]) for d in objects]
        tracked_objects, disappeared = self.tracker.update(rects)

        current_visible_ids = set()
        events = []
        bounding_boxes = []
        now = time.time()

        for obj_id, centroid in tracked_objects.items():
            cx, cy = centroid
            
            # Since tracking gives us centroids, we find the closest real box
            best_match = None
            min_dist = float('inf')
            for obj in objects:
                ox1, oy1, ox2, oy2, conf, cls_id = obj
                ocx, ocy = (ox1 + ox2) // 2, (oy1 + oy2) // 2
                dist = ((cx-ocx)**2 + (cy-ocy)**2)**0.5
                if dist < min_dist and dist < 50:
                    min_dist = dist
                    best_match = obj
                    
            if not best_match:
                continue
                
            x1, y1, x2, y2, conf, cls_id = best_match

            # Add to registry if not exists
            if obj_id not in self.registry:
                self.registry[obj_id] = {
                    "first_seen": now,
                    "last_seen": now,
                    "person_nearby_last": False,
                    "missing_count": 0,
                    "label": self.detector.model.names[cls_id],
                    "box": (x1, y1, x2, y2)
                }

            # Update visible registry entry
            data = self.registry[obj_id]
            data["last_seen"] = now
            data["missing_count"] = 0
            data["box"] = (x1, y1, x2, y2)

            # Check nearby persons
            person_nearby = False
            for p in persons:
                px1, py1, px2, py2, _, _ = p
                if not (px2 < x1 or px1 > x2 or py2 < y1 or py1 > y2):
                    person_nearby = True
                    break
            data["person_nearby_last"] = person_nearby

            current_visible_ids.add(obj_id)

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
            cv2.putText(frame, data["label"], (x1, y1-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
            
            bounding_boxes.append({
                "class": data["label"],
                "x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1), "confidence": conf
            })

        # Process Missing Objects (Removal Logic)
        for obj_id, data in list(self.registry.items()):
            if obj_id not in current_visible_ids:
                data["missing_count"] += 1
                
                if data["missing_count"] > self.N_FRAMES_MISSING:
                    # Determine removal type (Normal vs Suspicious)
                    removal_type = "Normal" if data["person_nearby_last"] else "Suspicious"
                    logger.warning(f"Object {data['label']} removed: {removal_type}")
                    
                    events.append({
                        "camera_id": camera_id,
                        "module_key": "object-removal",
                        "label": f"{removal_type} Removal",
                        "confidence": 1.0,
                        "timestamp": now,
                        "meta": {
                            "message": f"Object {data['label']} removed. Suspicious: {not data['person_nearby_last']}",
                            "type": removal_type,
                            "object_type": data['label']
                        }
                    })
                    
                    del self.registry[obj_id]

        return frame, events, bounding_boxes
