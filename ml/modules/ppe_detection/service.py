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
        self.person_states = {} # Proximal person tracking: {grid_pos: {"missing": [], "count": 0, "last_seen": 0}}
        self.SMOOTH_FRAMES = 5

    def _load(self):
        if not self.model_loaded:
            logger.info("Loading PPE Detection model ...")
            try:
                self.detector = PPEDetector(conf=0.3)
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

        h, w = frame.shape[:2]
        persons, ppe_items = self.detector.detect_all(frame)
        
        events = []
        bounding_boxes = []
        ppe_names = self.detector.model.names
        now = time.time()

        for p_box in persons:
            px1, py1, px2, py2, p_conf, _ = p_box
            helmet_present = False
            vest_present = False
            gloves_present = False
            boots_present = False
            items_found = 0

            person_ppe_boxes = []
            for i_box in ppe_items:
                if self.is_inside(p_box, i_box):
                    ix1, iy1, ix2, iy2, i_conf, cls_id = i_box
                    label = ppe_names.get(cls_id, "Unknown").lower()
                    if "helmet" in label: helmet_present = True
                    elif "vest" in label: vest_present = True
                    elif "gloves" in label: gloves_present = True
                    elif "boots" in label or "shoes" in label: boots_present = True
                    
                    items_found += 1
                    
                    # Colors
                    color_ppe = (255, 255, 0) # Helmet
                    if "vest" in label: color_ppe = (0, 165, 255) 
                    elif "gloves" in label: color_ppe = (255, 0, 255)
                    elif "boots" in label or "shoes" in label: color_ppe = (0, 255, 255)
                    
                    cv2.rectangle(frame, (ix1, iy1), (ix2, iy2), color_ppe, 1)
                    cv2.putText(frame, label, (ix1, iy1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color_ppe, 1)

                    detection_item = {
                        "class": label.capitalize(),
                        "x": int(ix1), "y": int(iy1), "w": int(ix2 - ix1), "h": int(iy2 - iy1),
                        "confidence": float(i_conf)
                    }
                    bounding_boxes.append(detection_item)
                    person_ppe_boxes.append(detection_item)

            # Heuristic: Only check shoes if feet are likely visible (not at bottom edge)
            feet_visible = py2 < (h - 30)
            
            # Basic compliance check for this frame
            frame_missing = []
            if not helmet_present: frame_missing.append("Helmet")
            if not vest_present: frame_missing.append("Vest")
            if not gloves_present: frame_missing.append("Gloves")
            if not boots_present and feet_visible: frame_missing.append("Shoes")
            
            # Worker check: if detected any PPE, assume it's a worker who SHOULD have PPE
            is_worker = items_found > 0
            
            # Simple Smoothing (Centroid Hysteresis)
            cx, cy = (px1 + px2) // 2, (py1 + py2) // 2
            grid_id = f"{cx//60}_{cy//60}"
            
            if is_worker:
                if grid_id not in self.person_states:
                    self.person_states[grid_id] = {"missing": frame_missing, "stability_count": 1, "last_seen": now}
                else:
                    state = self.person_states[grid_id]
                    if set(state["missing"]) == set(frame_missing):
                        state["stability_count"] = min(state["stability_count"] + 1, self.SMOOTH_FRAMES)
                    else:
                        state["stability_count"] -= 1
                        if state["stability_count"] <= 0:
                            state["missing"] = frame_missing
                            state["stability_count"] = 1
                    state["last_seen"] = now

                # Use smoothed status
                current_missing = self.person_states[grid_id]["missing"]
                is_compliant = len(current_missing) == 0
            else:
                is_compliant = True # Non-workers are ignored
                current_missing = []

            color = (0, 255, 0) if is_compliant else (0, 0, 255)
            cv2.rectangle(frame, (px1, py1), (px2, py2), color, 2)
            
            p_label = "Compliant" if is_compliant else f"Non-Compliant (Missing: {', '.join(current_missing)})"
            cv2.putText(frame, p_label, (px1, py1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            bounding_boxes.append({
                "class": f"Person ({p_label})",
                "x": int(px1), "y": int(py1), "w": int(px2 - px1), "h": int(py2 - py1), "confidence": p_conf
            })

            if not is_compliant and is_worker:
                if now - self.last_log_time > self.LOG_INTERVAL:
                    events.append({
                        "camera_id": camera_id,
                        "module_key": "ppe-detection",
                        "label": "PPE Violation",
                        "confidence": float(p_conf),
                        "timestamp": now,
                        "meta": {
                            "message": f"Missing: {', '.join(current_missing)}",
                            "boxes": [{"class": "Person", "x": int(px1), "y": int(py1), "w": int(px2 - px1), "h": int(py2 - py1)}] + person_ppe_boxes
                        }
                    })
                    self.last_log_time = now

        # Cleanup expired states
        self.person_states = {k: v for k, v in self.person_states.items() if now - v["last_seen"] < 1.0}

        return frame, events, bounding_boxes
