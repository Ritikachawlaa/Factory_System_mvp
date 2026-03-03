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

        tracks = self.detector.detect_all(frame)
        events = []
        boxes = []
        
        current_track_ids = set()

        # Update memory with new tracking data
        for trk in tracks:
            x1, y1, x2, y2, track_id, conf, cls_id = trk
            label = self.detector.model.names[cls_id]
            current_track_ids.add(track_id)
            
            # Store/Update in memory
            self.track_memory[track_id] = {
                "label": label,
                "box": (x1, y1, x2, y2),
                "last_seen": 0, # Active
                "confidence": float(conf)
            }

        # Handle persistence and cleanup
        expired_ids = []
        for tid, data in self.track_memory.items():
            if tid not in current_track_ids:
                data["last_seen"] += 1
                if data["last_seen"] > self.PERSISTENCE_FRAMES:
                    expired_ids.append(tid)
                    continue
            
            # Draw and prepare output for active or persisting objects
            x1, y1, x2, y2 = data["box"]
            label = data["label"]
            conf = data["confidence"]
            
            # Draw box on frame
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, f"{label} #{tid} {conf:.2f}", (x1, y1-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            boxes.append({
                "class": label,
                "track_id": tid,
                "x": int(x1),
                "y": int(y1),
                "w": int(x2 - x1),
                "h": int(y2 - y1),
                "confidence": conf
            })

        for eid in expired_ids:
            del self.track_memory[eid]

        return frame, events, boxes
