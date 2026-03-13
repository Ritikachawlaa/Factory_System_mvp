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
        self.logged_tracks = {} # track_id -> status_key

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
        """Classify vest color using HSV thresholds."""
        if roi is None or roi.size == 0:
            return "UNKNOWN"
        
        try:
            hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        except Exception:
            return "UNKNOWN"
        
        # Red ranges
        lower_red1 = np.array([0, 120, 70])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 120, 70])
        upper_red2 = np.array([180, 255, 255])
        red_mask = cv2.inRange(hsv, lower_red1, upper_red1) + cv2.inRange(hsv, lower_red2, upper_red2)
        
        # Orange range
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
        
        not_verified_pixels = red_pixels + orange_pixels
        min_pixels = 300

        if not_verified_pixels > green_pixels and not_verified_pixels > min_pixels:
            return "NOT_VERIFIED"
        elif green_pixels > not_verified_pixels and green_pixels > min_pixels:
            return "VERIFIED"
        return "UNKNOWN"

    def is_inside(self, person_box, ppe_box):
        px1, py1, px2, py2, _, _ = person_box
        gx1, gy1, gx2, gy2, _, _ = ppe_box
        cx = (gx1 + gx2) / 2
        cy = (gy1 + gy2) / 2
        return (px1 <= cx <= px2) and (py1 <= cy <= py2)

    def process_frame(self, frame, camera_id=0):
        self._load()
        if self.detector is None:
            return frame, [], []

        # 1. Tracker for persistent IDs
        tracks = self.detector.track(frame, classes=[0])
        
        # 2. PPE items for vest check
        ppe_items = []
        if self.detector.ppe_detector:
            ppe_items = self.detector.ppe_detector.detect(frame, classes=[0, 1, 2, 3])

        verified_count = 0
        not_verified_count = 0
        unknown_count = 0
        bounding_boxes = []
        events = []
        
        current_frame_ids = set()

        for track in tracks:
            x1, y1, x2, y2, track_id, conf, cls = track
            current_frame_ids.add(track_id)
            person_box = (x1, y1, x2, y2, conf, cls)
            
            # Vest detection
            vest_found = False
            if self.detector.ppe_detector:
                ppe_names = self.detector.ppe_detector.model.names
                for i_box in ppe_items:
                    ix1, iy1, ix2, iy2, i_conf, cls_id = i_box
                    label = ppe_names.get(cls_id, "").lower()
                    if "vest" in label and self.is_inside(person_box, i_box):
                        vest_found = True
                        break
            
            if not vest_found:
                status = "Unknown (No Vest)"
                b_color = (128, 128, 128) # BGR Grey
                hex_color = "#6b7280"     # CSS Grey
                status_key = "UNKNOWN_NO_VEST"
                unknown_count += 1
            else:
                # Color analysis
                h = y2 - y1
                torso_roi = frame[max(0, y1 + int(h*0.2)):min(frame.shape[0], y1 + int(h*0.6)), 
                                  max(0, x1):min(frame.shape[1], x2)]
                color_label = self.classify_vest_color(torso_roi)
                
                if color_label == "VERIFIED":
                    status = "Verified (Permanent)"
                    b_color = (0, 255, 0) # BGR Green
                    hex_color = "#10b981" # CSS Green
                    status_key = "VERIFIED"
                    verified_count += 1
                elif color_label == "NOT_VERIFIED":
                    status = "Not Verified"
                    b_color = (0, 0, 255) # BGR Red
                    hex_color = "#ef4444" # CSS Red
                    status_key = "NOT_VERIFIED"
                    not_verified_count += 1
                else:
                    status = "Unknown (Color)"
                    b_color = (0, 165, 255) # BGR Orange
                    hex_color = "#f59e0b"    # CSS Orange
                    status_key = "UNKNOWN_COLOR"
                    unknown_count += 1

            # Draw & Collect Bounding Box
            cv2.rectangle(frame, (x1, y1), (x2, y2), b_color, 2)
            display_text = f"{status} #{track_id}" if track_id != -1 else status
            cv2.putText(frame, display_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, b_color, 2)
            
            bounding_boxes.append({
                "class": status,
                "label": display_text,
                "track_id": track_id,
                "x": int(x1), "y": int(y1), "w": int(x2-x1), "h": int(y2-y1),
                "confidence": float(conf),
                "color": hex_color
            })
            
            # 3. Deduplicated logging
            if track_id != -1:
                if self.logged_tracks.get(track_id) != status_key:
                    msg = f"{status} Labour Detected | ID: #{track_id}"
                    if status_key == "NOT_VERIFIED":
                        msg = f"Unverified (Temporary) Labour Detected | ID: #{track_id}"
                    
                    events.append({
                        "camera_id": camera_id,
                        "module_key": "labour-counting",
                        "label": "Labour Counting",
                        "confidence": float(conf),
                        "timestamp": time.time(),
                        "meta": {
                            "message": msg,
                            "track_id": track_id,
                            "status": status_key,
                            "verified": verified_count,
                            "not_verified": not_verified_count
                        }
                    })
                    self.logged_tracks[track_id] = status_key

        # 4. Cleanup old tracks (simplified)
        # To avoid memory leak or stale statuses, if an ID is gone for long, remove it.
        # But for BoT-SORT, we want it to re-log if they re-enter with same ID? 
        # User said: "untill and unless, the person exists and re- enters".
        # If we remove IDs from logged_tracks if they aren't in this frame, 
        # then re-entry will ALWAYS re-log (even with same ID).
        # This is exactly what the user asked.
        
        all_ids = list(self.logged_tracks.keys())
        for tid in all_ids:
            if tid not in current_frame_ids:
                # Safer: only remove if not seen for N frames to avoid flickering logs
                # For now, let's keep it simple: if not in frame, it's "exited" for logging state
                del self.logged_tracks[tid]

        # Summary
        total = verified_count + not_verified_count + unknown_count
        cv2.putText(frame, f"Total: {total} | V: {verified_count} | NV: {not_verified_count}",
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        return frame, events, bounding_boxes
