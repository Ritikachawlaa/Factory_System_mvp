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

    # ---- Vest color classification (Refined for Green vs Orange/Red) ----
    def classify_vest_color(self, roi):
        """Classify vest color using HSV thresholds."""
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
        
        # Orange range (approx 10-25 in HSV)
        lower_orange = np.array([10, 100, 100])
        upper_orange = np.array([25, 255, 255])
        orange_mask = cv2.inRange(hsv, lower_orange, upper_orange)
        
        # Green range
        lower_green = np.array([35, 50, 50])
        upper_green = np.array([85, 255, 255])
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        
        red_pixels = cv2.countNonZero(red_mask)
        orange_pixels = cv2.countNonZero(orange_mask)
        green_pixels = cv2.countNonZero(green_mask)
        
        # Combine Red and Orange into a single "Non-Verified" pool
        not_verified_pixels = red_pixels + orange_pixels
        
        # Require a minimum pixel count to avoid noise
        min_pixels = 300
        if not_verified_pixels > green_pixels and not_verified_pixels > min_pixels:
            return "NOT_VERIFIED"
        elif green_pixels > not_verified_pixels and green_pixels > min_pixels:
            return "VERIFIED"
        else:
            return "UNKNOWN"

    def is_inside(self, person_box, ppe_box):
        px1, py1, px2, py2, _, _ = person_box
        gx1, gy1, gx2, gy2, _, _ = ppe_box
        cx = (gx1 + gx2) / 2
        cy = (gy1 + gy2) / 2
        return (px1 <= cx <= px2) and (py1 <= cy <= py2)

    # ---- main entry point ----
    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, [], []

        # Get persons and PPE items if available
        persons = []
        ppe_items = []
        if hasattr(self.detector, 'ppe_detector') and self.detector.ppe_detector:
            persons, ppe_items = self.detector.ppe_detector.detect_all(frame)
        else:
            persons = self.detector.detect(frame, classes=[0])

        verified_count = 0
        not_verified_count = 0
        unknown_count = 0
        bounding_boxes = []
        events = []

        for p_box in persons:
            px1, py1, px2, py2, p_conf, p_cls = p_box
            
            # Find if this person is wearing a vest
            vest_found = False
            for i_box in ppe_items:
                ix1, iy1, ix2, iy2, i_conf, cls_id = i_box
                label = self.detector.ppe_detector.model.names.get(cls_id, "").lower()
                if "vest" in label and self.is_inside(p_box, i_box):
                    vest_found = True
                    break
            
            if not vest_found:
                # No vest detected, classify as unknown/unclassified labour
                status = "Unknown (No Vest)"
                box_color = (128, 128, 128) # Grey
                unknown_count += 1
            else:
                # Crop the torso region for vest color analysis
                h = py2 - py1
                torso_top = max(0, py1 + int(h * 0.2))
                torso_bot = min(frame.shape[0], py1 + int(h * 0.6))
                vest_roi = frame[torso_top:torso_bot, max(0, px1):min(frame.shape[1], px2)]
                
                color_label = self.classify_vest_color(vest_roi)
                
                if color_label == "VERIFIED":
                    verified_count += 1
                    box_color = (0, 255, 0)    # Green
                    status = "Verified (Permanent)"
                elif color_label == "NOT_VERIFIED":
                    not_verified_count += 1
                    box_color = (0, 0, 255)    # Red/Orange
                    status = "Not Verified"
                else:
                    unknown_count += 1
                    box_color = (255, 165, 0)  # Orange
                    status = "Unknown (Color)"

            # Draw bounding box
            cv2.rectangle(frame, (px1, py1), (px2, py2), box_color, 2)
            cv2.putText(frame, status, (px1, py1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 2)
            
            bounding_boxes.append({
                "class": status,
                "x": int(px1), "y": int(py1),
                "w": int(px2 - px1), "h": int(py2 - py1),
                "confidence": float(p_conf)
            })

        # Summary overlay
        total = verified_count + not_verified_count + unknown_count
        cv2.putText(frame, f"Total: {total} | Verified: {verified_count} | Not Verified: {not_verified_count}",
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Periodic event logging
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
                    "verified": verified_count,
                    "not_verified": not_verified_count,
                    "unknown": unknown_count
                }
            })
            self.last_log_time = now

        return frame, events, bounding_boxes
