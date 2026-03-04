"""
Object Abandonment – Service
Detects if an object is left unattended for a period of time.
"""
import time
import math
import logging
import cv2
from .detector import AbandonmentDetector

logger = logging.getLogger("object_abandonment")

class ObjectAbandonmentService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.object_memory = {}
        self.STATIC_TIME_THRESHOLD = 30 # seconds
        self.PIXEL_MOVEMENT_THRESHOLD = 5
        self.PERSON_RADIUS_FACTOR = 2.0
        self.last_log_time = 0

    def _load(self):
        if not self.model_loaded:
            try:
                self.detector = AbandonmentDetector(conf=0.4)
                self.model_loaded = True
                logger.info("Object Abandonment model loaded.")
            except Exception as e:
                logger.error(f"Object Abandonment model load failed: {e}")

    def _distance(self, p1, p2):
        return math.hypot(p1[0]-p2[0], p1[1]-p2[1])

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, [], []
        detected_objects = self.detector.detect_objects(frame)
        persons = [d for d in detected_objects if d[5] == 0]
        objects = [d for d in detected_objects if d[5] != 0]

        rects = [(d[0], d[1], d[2], d[3]) for d in objects]
        tracked_objects, disappeared = self.tracker.update(rects)

        events = []
        bounding_boxes = []
        now = time.time()

        for obj_id, centroid in tracked_objects.items():
            cx, cy = centroid
            
            # Find the original bounding box explicitly for drawing
            best_match = None
            min_dist = float('inf')
            for obj in objects:
                ox1, oy1, ox2, oy2, conf, cls_id = obj
                ocx, ocy = (ox1 + ox2) // 2, (oy1 + oy2) // 2
                dist = self._distance((cx, cy), (ocx, ocy))
                if dist < min_dist and dist < 50:
                    min_dist = dist
                    best_match = obj
                    
            if not best_match:
                # Ghost objects, skipping
                continue
                
            x1, y1, x2, y2, conf, cls_id = best_match

            # Abandonment mapping
            if obj_id not in self.object_memory:
                self.object_memory[obj_id] = {
                    "centroid": (cx, cy),
                    "static_start": now,
                    "abandoned": False,
                    "last_seen": now,
                    "first_reported": False
                }
            
            mem = self.object_memory[obj_id]
            movement = self._distance(mem["centroid"], (cx, cy))
            
            # Reset static start if moved 
            if movement > self.PIXEL_MOVEMENT_THRESHOLD:
                mem["static_start"] = now
            
            mem["centroid"] = (cx, cy)
            mem["last_seen"] = now
            static_time = now - mem["static_start"]
            
            # Ignore items that are "disappeared" temporarily from triggering tracking boxes
            if disappeared.get(obj_id, 0) > 0:
                continue

            unattended = True
            for person in persons:
                px1, py1, px2, py2, _, _ = person
                pcx, pcy = (px1 + px2) // 2, (py1 + py2) // 2
                radius = (x2 - x1) * self.PERSON_RADIUS_FACTOR
                if self._distance((pcx, pcy), (cx, cy)) < radius:
                    unattended = False
                    break
            
            color = (0, 255, 0)
            status = "Monitoring"
            
            if static_time >= self.STATIC_TIME_THRESHOLD and unattended:
                mem["abandoned"] = True
                color = (0, 0, 255)
                status = "ABANDONED"
                
                if not mem["first_reported"] or (now - self.last_log_time > 10):
                    events.append({
                        "camera_id": camera_id,
                        "module_key": "object-abandonment",
                        "label": "Abandoned Object",
                        "confidence": float(conf),
                        "timestamp": now,
                        "meta": {
                            "message": f"Object {self.detector.model.names[cls_id]} left for {int(static_time)}s",
                            "duration": int(static_time),
                            "object_type": self.detector.model.names[cls_id],
                        }
                    })
                    self.last_log_time = now
                    mem["first_reported"] = True

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"{status} ({int(static_time)}s)", (x1, y1-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            bounding_boxes.append({
                "class": f"{self.detector.model.names[cls_id]} ({status})",
                "x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1), "confidence": conf
            })

        return frame, events, bounding_boxes
