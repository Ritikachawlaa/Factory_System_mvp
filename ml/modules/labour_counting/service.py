"""
Labour Counting – Service
Counts workers (persons) on site and emits periodic workforce-count events.
Designed for shift-based monitoring of labour presence.
"""
import cv2
import time
import logging
import numpy as np
from .detector import LabourDetector

logger = logging.getLogger("labour_counting")


class LabourCountingService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.last_count = 0
        self.last_log_time = 0
        self.LOG_INTERVAL = 15          # report every 15 s (workforce reports less chatty)

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading Labour Counting model …")
            try:
                self.detector = LabourDetector(conf=0.4)
                self.model_loaded = True
                logger.info("Labour Counting model loaded.")
            except Exception as e:
                logger.error(f"Labour Counting model load failed: {e}")

    def classify_vest_color(self, roi):
        hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        
        # Red ranges
        lower_red1 = np.array([0, 120, 70])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 120, 70])
        upper_red2 = np.array([180, 255, 255])
        
        red_mask = cv2.inRange(hsv, lower_red1, upper_red1) + cv2.inRange(hsv, lower_red2, upper_red2)
        
        # Green range
        lower_green = np.array([35, 50, 50])
        upper_green = np.array([85, 255, 255])
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        
        red_pixels = cv2.countNonZero(red_mask)
        green_pixels = cv2.countNonZero(green_mask)
        
        if red_pixels > green_pixels and red_pixels > 500:
            return "RED"
        elif green_pixels > red_pixels and green_pixels > 500:
            return "GREEN"
        else:
            return "UNKNOWN"

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, []

        # We also need ppe_best.pt for vest detection if we want accurate color counting
        # But for now, let's assume we use the person boxes and crop middle section
        tracks = self.detector.track(frame) # Using track for persistent IDs
        
        red_count = 0
        green_count = 0
        bounding_boxes = []
        events = []

        for (x1, y1, x2, y2, track_id, conf, _) in tracks:
            # Crop middle section for vest detection
            h = y2 - y1
            vest_roi = frame[y1 + int(h*0.2):y1 + int(h*0.6), x1:x2]
            
            color_label = "UNKNOWN"
            if vest_roi.size > 0:
                color_label = self.classify_vest_color(vest_roi)
            
            if color_label == "RED":
                red_count += 1
                color = (0, 0, 255)
            elif color_label == "GREEN":
                green_count += 1
                color = (0, 255, 0)
            else:
                color = (255, 165, 0)

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"Worker {track_id} [{color_label}]", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
            bounding_boxes.append({
                "class": f"Worker ({color_label})",
                "x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1), 
                "confidence": conf,
                "track_id": track_id
            })

        # Event logic
        now = time.time()
        if now - self.last_log_time > self.LOG_INTERVAL:
            events.append({
                "camera_id": camera_id,
                "module_key": "labour-counting",
                "label": "Workforce Sync",
                "timestamp": now,
                "meta": f"Red: {red_count}, Green: {green_count}, Total: {len(tracks)}"
            })
            self.last_log_time = now

        return frame, events, bounding_boxes
