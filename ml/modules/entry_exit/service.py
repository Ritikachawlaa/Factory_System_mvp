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
    
    def update_config(self, config):
        if 'line_y' in config:
            self.line_y = int(config['line_y'])
            
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

    def process_frame(self, frame, camera_id=0):
        boxes = self.detector.detect(frame)
        objects = self.tracker.update(boxes)
        track_boxes = self._match_tracks_to_boxes(boxes, objects)
        events = []
        bounding_boxes = []

        current_centroids = objects
        
        for obj_id, (cx, cy) in current_centroids.items():
            if obj_id in self.prev_centroids:
                prev_cx, prev_cy = self.prev_centroids[obj_id]
                direction = crossed_line(prev_cy, cy, self.line_y)
                
                if direction:
                    if direction == "IN":
                        self.in_count += 1
                        label = f"Entry Detected (ID #{obj_id})"
                    else:
                        self.out_count += 1
                        label = f"Exit Detected (ID #{obj_id})"
                    
                    event = {
                        "camera_id": camera_id,
                        "module_key": "entry-exit",
                        "label": label,
                        "confidence": 1.0,
                        "timestamp": time.time(),
                        "meta": f"Track ID: {obj_id}, Direction: {direction}, Total: In={self.in_count}, Out={self.out_count}"
                    }
                    events.append(event)
        
        self.prev_centroids = current_centroids.copy()

        for obj_id, (x1, y1, x2, y2) in track_boxes.items():
            cv2.rectangle(frame, (x1, int(y1)), (x2, int(y2)), (255, 0, 0), 2)
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
        
        # Draw Line
        h, w = frame.shape[:2]
        cv2.line(frame, (0, self.line_y), (w, self.line_y), (0, 0, 255), 2)
        
        # Draw counts
        cv2.putText(frame, f"IN: {self.in_count} OUT: {self.out_count}", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        return frame, events, bounding_boxes
