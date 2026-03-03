"""
Labour Counting – Service
Counts workers on site and classifies by vest colour:
  • GREEN vest → Permanent Worker
  • RED vest   → Not Permanent (Contract / Visitor)
Uses HSV colour analysis on the torso region of each tracked person.
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
        self.last_log_time = 0
        self.LOG_INTERVAL = 15
        self.last_boxes_found = False

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading Labour Counting model …")
            try:
                self.detector = LabourDetector(conf=0.4)
                self.model_loaded = True
                logger.info("Labour Counting model loaded.")
            except Exception as e:
                logger.error(f"Labour Counting model load failed: {e}")

    # ---- Vest colour classification (from reference Labour_counting/app.py) ----
    def classify_vest_color(self, roi):
        """Classify vest colour using HSV thresholds."""
        if roi is None or roi.size == 0:
            return "UNKNOWN"
        
        try:
            hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        except Exception:
            return "UNKNOWN"
        
        # Red ranges (wraps around 0/180 in HSV)
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
        
        # Require a minimum pixel count to avoid noise
        min_pixels = 300
        if red_pixels > green_pixels and red_pixels > min_pixels:
            return "RED"
        elif green_pixels > red_pixels and green_pixels > min_pixels:
            return "GREEN"
        else:
            return "UNKNOWN"

    # ---- main entry point ----
    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, [], []

        # Track persons with persistent IDs
        tracks = self.detector.track(frame, classes=[0])

        permanent_count = 0
        contract_count = 0
        unknown_count = 0
        bounding_boxes = []
        events = []

        for (x1, y1, x2, y2, track_id, conf, _) in tracks:
            # Crop the torso region (20%-60% of the person height) for vest analysis
            h = y2 - y1
            torso_top = max(0, y1 + int(h * 0.2))
            torso_bot = min(frame.shape[0], y1 + int(h * 0.6))
            vest_roi = frame[torso_top:torso_bot, max(0, x1):min(frame.shape[1], x2)]
            
            color_label = self.classify_vest_color(vest_roi)
            
            if color_label == "GREEN":
                permanent_count += 1
                box_color = (0, 255, 0)    # Green
                status = "Permanent"
            elif color_label == "RED":
                contract_count += 1
                box_color = (0, 0, 255)    # Red
                status = "Not Permanent"
            else:
                unknown_count += 1
                box_color = (255, 165, 0)  # Orange
                status = "Unclassified"

            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)
            label_text = f"{status} #{track_id}" if track_id != -1 else status
            cv2.putText(frame, label_text, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 2)
            
            bounding_boxes.append({
                "class": f"Worker ({status})",
                "x": int(x1), "y": int(y1),
                "w": int(x2 - x1), "h": int(y2 - y1),
                "confidence": conf
            })

        # Summary overlay
        total = permanent_count + contract_count + unknown_count
        cv2.putText(frame, f"Total: {total} | Permanent: {permanent_count} | Not Permanent: {contract_count}",
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Periodic event
        now = time.time()
        if now - self.last_log_time > self.LOG_INTERVAL:
            events.append({
                "camera_id": camera_id,
                "module_key": "labour-counting",
                "label": "Workforce Sync",
                "confidence": 1.0,
                "timestamp": now,
                "meta": {
                    "total_count": total,
                    "permanent": permanent_count,
                    "not_permanent": contract_count,
                    "unclassified": unknown_count
                }
            })
            self.last_log_time = now

        return frame, events, bounding_boxes
