import cv2
import logging
import time
from .detector import PersonDetector
from modules.line_crossing.tracker import CentroidTracker

logger = logging.getLogger("entry_exit")

class EntryExitService:
    def __init__(self):
        self.detector = PersonDetector()
        self.tracker = CentroidTracker(max_distance=50)
        self.active_tracks = set()
        self.in_count = 0
        self.out_count = 0
    
    def update_config(self, config):
        pass # No visual configs needed for full-frame entry/exit
            
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

        current_track_ids = set(objects.keys())
        
        # Check for new entries
        for obj_id in current_track_ids:
            if obj_id not in self.active_tracks:
                self.in_count += 1
                self.active_tracks.add(obj_id)
                event = {
                    "camera_id": camera_id,
                    "module_key": "entry-exit",
                    "label": f"Entry Detected (ID #{obj_id})",
                    "confidence": 1.0,
                    "timestamp": time.time(),
                    "meta": f"Track ID: {obj_id}, Total: In={self.in_count}, Out={self.out_count}"
                }
                events.append(event)
                
        # Check for exits
        missing_tracks = self.active_tracks - current_track_ids
        for obj_id in missing_tracks:
            self.out_count += 1
            self.active_tracks.remove(obj_id)
            event = {
                "camera_id": camera_id,
                "module_key": "entry-exit",
                "label": f"Exit Detected (ID #{obj_id})",
                "confidence": 1.0,
                "timestamp": time.time(),
                "meta": f"Track ID: {obj_id}, Total: In={self.in_count}, Out={self.out_count}"
            }
            events.append(event)

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
        
        # Draw counts
        cv2.putText(frame, f"IN: {self.in_count} OUT: {self.out_count}", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        return frame, events, bounding_boxes
