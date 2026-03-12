"""
Crowd Density – Service
Alerts when crowd density exceeds a threshold or changes significantly.
Draws the density grid overlay on the frame.
"""
import cv2
import time
import logging
import numpy as np
from .detector import CrowdDensityDetector, GRID_SIZE

logger = logging.getLogger("crowd_density")

DENSITY_ALERT_THRESHOLD = 5      # alert when >= 5 people in ANY single grid cell
COUNT_CHANGE_THRESHOLD = 3       # event on >=3 person count swing


class CrowdDensityService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.last_count = 0
        self.last_log_time = 0
        self.LOG_INTERVAL = 10
        self.threshold = 5

    def update_config(self, config):
        if 'threshold' in config:
            self.threshold = int(config['threshold'])

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading Crowd Density model …")
            try:
                self.detector = CrowdDensityDetector(conf=0.4)
                self.model_loaded = True
                logger.info("Crowd Density model loaded.")
            except Exception as e:
                logger.error(f"Crowd Density model load failed: {e}")

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, []

        threshold = self.threshold

        boxes, grid, density = self.detector.detect(frame)
        count = len(boxes)
        events = []
        bounding_boxes = []
        h, w = frame.shape[:2]

        # Determine color and label based on threshold
        is_crowd = count >= threshold
        box_color = (0, 0, 255) if is_crowd else (0, 255, 0) # Red if crowd, Green if not
        label = "Crowd" if is_crowd else "Person"

        # Draw person boxes
        for (x1, y1, x2, y2) in boxes:
            cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)
            bounding_boxes.append({
                "class": label,
                "x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1), 
                "confidence": 1.0,
                "is_crowd": is_crowd
            })

        # Draw grid overlay
        cell_w = int(w / GRID_SIZE)
        cell_h = int(h / GRID_SIZE)
        for i in range(GRID_SIZE):
            for j in range(GRID_SIZE):
                cv2.rectangle(frame,
                              (j * cell_w, i * cell_h),
                              ((j + 1) * cell_w, (i + 1) * cell_h),
                              (255, 255, 255), 1)
                cell_count = int(grid[i][j])
                if cell_count > 0:
                    text_color = (0, 0, 255) if cell_count >= threshold else (0, 255, 0)
                    cv2.putText(frame, str(cell_count),
                                (j * cell_w + 5, i * cell_h + 20),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, text_color, 2)

        cv2.putText(frame, f"People: {count}/{threshold}  Density: {density:.4f}", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        # Event logic
        now = time.time()
        hot_cells = int(np.sum(grid >= threshold))
        
        # Trigger event if above threshold or significant change
        if is_crowd:
            event_label = "Crowd Detected"
            events.append({
                "camera_id": camera_id,
                "module_key": "crowd-density",
                "label": event_label,
                "confidence": 1.0,
                "timestamp": now,
                "meta": f"Count: {count}, Threshold: {threshold}"
            })
            self.last_count = count
            self.last_log_time = now
        elif count > 0 and (now - self.last_log_time > self.LOG_INTERVAL):
             # Periodic update even if not crowd
             events.append({
                "camera_id": camera_id,
                "module_key": "crowd-density",
                "label": "Density Update",
                "confidence": 1.0,
                "timestamp": now,
                "meta": f"Count: {count}, Threshold: {threshold}"
            })
             self.last_log_time = now

        return frame, events, bounding_boxes
