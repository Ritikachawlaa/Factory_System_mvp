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

        boxes, grid, density = self.detector.detect(frame)
        count = len(boxes)
        events = []
        bounding_boxes = []
        h, w = frame.shape[:2]

        # Draw person boxes
        for (x1, y1, x2, y2) in boxes:
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
            bounding_boxes.append({
                "class": "Crowd",
                "x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1), "confidence": 1.0
            })

        # Draw grid overlay (same style as Phase-1 repo)
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
                    cv2.putText(frame, str(cell_count),
                                (j * cell_w + 5, i * cell_h + 20),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        cv2.putText(frame, f"People: {count}  Density: {density:.6f}", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

        # Event logic
        now = time.time()
        hot_cells = int(np.sum(grid >= DENSITY_ALERT_THRESHOLD))
        changed = abs(count - self.last_count) >= COUNT_CHANGE_THRESHOLD
        timed = now - self.last_log_time > self.LOG_INTERVAL

        if (hot_cells > 0 or changed or (count > 0 and timed)):
            label = "High Crowd Density" if hot_cells > 0 else "Crowd Density Update"
            events.append({
                "camera_id": camera_id,
                "module_key": "crowd-density",
                "label": label,
                "confidence": 1.0,
                "timestamp": now,
                "meta": f"Count: {count}, Hot cells: {hot_cells}"
            })
            self.last_count = count
            self.last_log_time = now

        return frame, events, bounding_boxes
