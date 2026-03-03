"""
Object Detection – Service
Detects and draws a variety of common objects.
"""
import cv2
import logging
from .detector import ObjectDetector

logger = logging.getLogger("object_detection")

class ObjectDetectionService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.last_boxes_found = False
        self.track_memory = {} # track_id -> {label, box, last_seen, confidence}
        self.PERSISTENCE_FRAMES = 3 # Small buffer to prevent flicker

    def _load(self):
        if not self.model_loaded:
            try:
                self.detector = ObjectDetector(conf=0.65)
                self.model_loaded = True
                logger.info("Object Detection model loaded.")
            except Exception as e:
                logger.error(f"Object Detection model load failed: {e}")

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, [], []

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, [], []

        # Use track, but handle the case where tracker might be more stingy than detector
        tracks = self.detector.detect_all(frame)
        
        # If tracker returns nothing, try regular detection as fallback to ensure something is shown
        if not tracks:
            detections = self.detector.detect(frame, classes=None)
            # Convert detections (5-tuple) to track-like (7-tuple) with -1 as track_id
            tracks = [(d[0], d[1], d[2], d[3], -1, d[4], d[5]) for d in detections]

        events = []
        boxes = []
        current_track_ids = set()

        # Update memory with new tracking data
        for i, trk in enumerate(tracks):
            x1, y1, x2, y2, track_id, conf, cls_id = trk
            label = self.detector.model.names[cls_id]
            
            # Use unique key for track_memory: either track_id or a unique "untracked" key
            memory_key = track_id if track_id != -1 else f"untracked_{i}"
            current_track_ids.add(memory_key)
            
            # Store/Update in memory
            self.track_memory[memory_key] = {
                "label": label,
                "box": (x1, y1, x2, y2),
                "last_seen": 0, # Active
                "confidence": float(conf),
                "is_persistent": track_id != -1 # Only persist tracked objects
            }

        # Handle persistence and cleanup
        expired_keys = []
        for key, data in self.track_memory.items():
            if key not in current_track_ids:
                # If it's an untracked object, it disappears instantly (no persistence)
                if not data.get("is_persistent", False):
                    expired_keys.append(key)
                    continue
                    
                data["last_seen"] += 1
                if data["last_seen"] > self.PERSISTENCE_FRAMES:
                    expired_keys.append(key)
                    continue
            
            # Draw and prepare output for active or persisting objects
            x1, y1, x2, y2 = data["box"]
            label = data["label"]
            conf = data["confidence"]
            
            # Visuals: Different colors/labels for tracked vs untracked?
            # Tracked = GREEN, Untracked = CYAN
            color = (0, 255, 0) if data.get("is_persistent") else (255, 255, 0)
            id_str = f"#{key}" if data.get("is_persistent") else ""
            
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"{label} {id_str} {conf:.2f}", (x1, y1-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            boxes.append({
                "class": label,
                "track_id": key if data.get("is_persistent") else None,
                "x": int(x1),
                "y": int(y1),
                "w": int(x2 - x1),
                "h": int(y2 - y1),
                "confidence": conf
            })

        for ekey in expired_keys:
            del self.track_memory[ekey]

        return frame, events, boxes
