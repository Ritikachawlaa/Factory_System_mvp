import cv2
import os
import logging
from .detector import PersonDetector
from modules.line_crossing.tracker import CentroidTracker
import time

MODEL_PATH = "yolov8n.pt"

logger = logging.getLogger("loitering")

class LoiteringService:
    def __init__(self):
        self.detector = None
        self.tracker = CentroidTracker(max_distance=50)
        self.model_loaded = False

        self.person_threshold = 3
        self.time_threshold = 10
        self.first_seen_by_track = {}
        self.alerted_tracks = set()

    def load_model(self):
        if not self.model_loaded:
            print("Loitering: Loading YOLO...")
            try:
                specific_model = r"c:\Users\ritik\Desktop\testing\Ai_system_phase_1_repo\Core_model_1\Core_Model_1.pt"
                if os.path.exists(specific_model):
                    self.detector = PersonDetector(specific_model)
                else:
                    self.detector = PersonDetector(MODEL_PATH)
                self.model_loaded = True
                print("Loitering: YOLO Loaded.")
            except Exception as e:
                print(f"Loitering: Model Load Failed: {e}")

    def update_config(self, config):
        if 'threshold' in config:
            self.person_threshold = int(config['threshold'])
        if 'time_limit' in config:
            self.time_threshold = int(config['time_limit'])

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
        if not self.model_loaded:
            self.load_model()

        if self.detector is None:
            return frame, []

        boxes = self.detector.detect(frame)
        tracked_objects = self.tracker.update(boxes)
        track_boxes = self._match_tracks_to_boxes(boxes, tracked_objects)

        now = time.time()
        person_count = len(track_boxes)
        current_track_ids = set(tracked_objects.keys())

        events = []
        bounding_boxes = []

        # Clean stale tracks
        stale = set(self.first_seen_by_track.keys()) - current_track_ids
        for tid in stale:
            self.first_seen_by_track.pop(tid, None)
            self.alerted_tracks.discard(tid)

        # Evaluate loitering durations for all active tracks
        loitering_track_ids = []
        track_durations = {}

        for track_id, (x1, y1, x2, y2) in track_boxes.items():
            cx = (x1 + x2) / 2
            cy = (y1 + y2) / 2
            
            track_data = self.first_seen_by_track.get(track_id)
            if track_data is None:
                self.first_seen_by_track[track_id] = {"ts": now, "anchor": (cx, cy)}
                track_data = self.first_seen_by_track[track_id]
                
            anchor_x, anchor_y = track_data["anchor"]
            dist_sq = (cx - anchor_x)**2 + (cy - anchor_y)**2
            
            # If they moved significantly (e.g., more than ~20-30 pixels), reset their loitering timer
            if dist_sq > 900: # 30 pixels squared
                self.first_seen_by_track[track_id] = {"ts": now, "anchor": (cx, cy)}
                track_data = self.first_seen_by_track[track_id]

            duration = now - track_data["ts"]
            track_durations[track_id] = duration
            if duration >= self.time_threshold:
                loitering_track_ids.append(track_id)

        # Trigger events if the number of loiterers meets the person threshold
        if len(loitering_track_ids) >= self.person_threshold:
            for track_id in loitering_track_ids:
                if track_id not in self.alerted_tracks:
                    events.append({
                        "camera_id": camera_id,
                        "module_key": "loitering-detection",
                        "label": f"Loitering Detected (ID #{track_id})",
                        "confidence": 1.0,
                        "timestamp": now,
                        "meta": f"Track ID: {track_id}, Concurrent Loiterers: {len(loitering_track_ids)}, Duration: {int(track_durations[track_id])}s"
                    })
                    self.alerted_tracks.add(track_id)

        # Draw boxes and assign classes
        for track_id, (x1, y1, x2, y2) in track_boxes.items():
            is_loitering = track_id in loitering_track_ids

            color = (0, 0, 255) if is_loitering else (0, 255, 0)
            label = f"Loitering #{track_id}" if is_loitering else f"Person #{track_id}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, label, (x1, max(20, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            bounding_boxes.append({
                "class": "Loitering" if is_loitering else "Person",
                "track_id": int(track_id),
                "x": int(x1),
                "y": int(y1),
                "w": int(x2 - x1),
                "h": int(y2 - y1),
                "confidence": 1.0,
                "color": "#ef4444" if is_loitering else "#10b981"
            })

        cv2.putText(frame, f"Count: {person_count}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
        if person_count >= self.person_threshold:
            cv2.putText(frame, f"Tracking IDs: {person_count}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        return frame, events, bounding_boxes
