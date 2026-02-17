import cv2
import logging
import time
from .detector import PersonDetector
from .logic import crossed_line
from modules.line_crossing.tracker import CentroidTracker

logger = logging.getLogger("entry_exit")

class EntryExitService:
    def __init__(self):
        self.detector = PersonDetector()
        self.tracker = CentroidTracker(max_distance=50)
        self.prev_centroids = {} # id -> (cx, cy)
        self.line_y = 200 # Default line position
        self.in_count = 0
        self.out_count = 0

    def process_frame(self, frame, camera_id=0):
        boxes = self.detector.detect(frame)
        objects = self.tracker.update(boxes)
        events = []
        
        current_centroids = objects
        
        for obj_id, (cx, cy) in current_centroids.items():
            if obj_id in self.prev_centroids:
                prev_cx, prev_cy = self.prev_centroids[obj_id]
                direction = crossed_line(prev_cy, cy, self.line_y)
                
                if direction:
                    if direction == "IN":
                        self.in_count += 1
                        label = "Entry Detected"
                    else:
                        self.out_count += 1
                        label = "Exit Detected"
                    
                    event = {
                        "camera_id": camera_id,
                        "module_key": "entry_exit",
                        "label": label,
                        "confidence": 1.0,
                        "timestamp": time.time(),
                        "meta": f"Direction: {direction}, Total: In={self.in_count}, Out={self.out_count}"
                    }
                    events.append(event)
        
        self.prev_centroids = current_centroids.copy()
        
        # Draw Line
        h, w = frame.shape[:2]
        cv2.line(frame, (0, self.line_y), (w, self.line_y), (0, 0, 255), 2)
        
        # Draw counts
        cv2.putText(frame, f"IN: {self.in_count} OUT: {self.out_count}", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        return frame, events
