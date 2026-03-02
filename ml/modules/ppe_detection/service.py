"""
PPE Detection – Service
Checks compliance: does every person have a helmet and vest?
"""
import cv2
import time
import logging
from .detector import PPEDetector

logger = logging.getLogger("ppe_detection")

class PPEDetectionService:
    def __init__(self):
        self.detector = None
        self.model_loaded = False
        self.last_log_time = 0
        self.LOG_INTERVAL = 5

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading PPE Detection model ...")
            try:
                self.detector = PPEDetector(conf=0.4)
                self.model_loaded = True
                logger.info("PPE Detection model loaded.")
            except Exception as e:
                logger.error(f"PPE Detection model load failed: {e}")

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

        persons, ppe_items = self.detector.detect_all(frame)
        events = []
        bounding_boxes = []

        # PPE Classes mapping (from ppe_best.pt typically: 0: helmet, 1: vest, etc.)
        # Based on app.py: label = PPE_CLASSES[cls_id]
        # We'll use names from the model itself
        ppe_names = self.detector.model.names

        for p_box in persons:
            px1, py1, px2, py2, p_conf, _ = p_box
            helmet_present = False
            vest_present = False

            person_ppe_boxes = []
            for i_box in ppe_items:
                if self.is_inside(p_box, i_box):
                    ix1, iy1, ix2, iy2, i_conf, cls_id = i_box
                    label = ppe_names.get(cls_id, "Unknown").lower()
                    if "helmet" in label:
                        helmet_present = True
                    if "vest" in label:
                        vest_present = True
                    
                    person_ppe_boxes.append({
                        "class": label,
                        "x": int(ix1), "y": int(iy1), "w": int(ix2 - ix1), "h": int(iy2 - iy1)
                    })

            # ... drawing logic ...
            color = (0, 255, 0) if (helmet_present and vest_present) else (0, 0, 255)
            cv2.rectangle(frame, (px1, py1), (px2, py2), color, 2)
            
            p_label = "Compliant" if (helmet_present and vest_present) else "Non-Compliant"
            cv2.putText(frame, p_label, (px1, py1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            bounding_boxes.append({
                "class": f"Person ({p_label})",
                "x": int(px1), "y": int(py1), "w": int(px2 - px1), "h": int(py2 - py1), "confidence": p_conf
            })

            if not (helmet_present and vest_present):
                now = time.time()
                if now - self.last_log_time > self.LOG_INTERVAL:
                    missing = []
                    if not helmet_present: missing.append("Helmet")
                    if not vest_present: missing.append("Vest")
                    
                    events.append({
                        "camera_id": camera_id,
                        "module_key": "ppe-detection",
                        "label": "PPE Violation",
                        "confidence": float(p_conf),
                        "timestamp": now,
                        "metadata": {
                            "message": f"Missing: {', '.join(missing)}",
                            "boxes": [
                                {
                                    "class": "Person",
                                    "x": int(px1), "y": int(py1), "w": int(px2 - px1), "h": int(py2 - py1)
                                }
                            ] + person_ppe_boxes
                        }
                    })
                    self.last_log_time = now

        return frame, events, bounding_boxes
