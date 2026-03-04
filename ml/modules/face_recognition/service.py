import time
import cv2
import logging
from utils import recognition

logger = logging.getLogger("face_recognition")

class FaceRecognitionService:
    def __init__(self):
        # Load known faces on startup
        recognition.load_know_faces_safe()
        self.last_events = {} # Map name -> timestamp to throttle events
        self.THROTTLE_SECONDS = 5.0
        self.track_rec_frames = {} # track_id -> frames_since_rec

    def process_frame(self, frame, camera_id=0, detection_frame=None, tracked_info=None):
        """
        Processes a frame for face recognition.
        """
        track_id = tracked_info.get("track_id") if tracked_info else None
        
        # 1. OPTIMIZATION: If track already has a valid identity, SKIP ML
        if track_id:
            from utils.integration_service import integration_service
            existing_identity = integration_service.get_identity(track_id)
            if existing_identity and "Unknown" not in existing_identity:
                integration_service.touch_identity(track_id)
                # Already matched! Return the locked identity
                return frame, [], [{
                    "id": track_id,
                    "class": existing_identity,
                    "x": tracked_info.get("x", 0), "y": tracked_info.get("y", 0), 
                    "w": tracked_info.get("w", 0), "h": tracked_info.get("h", 0), 
                    "confidence": 1.0
                }]

            # 2. BURST + FREQUENCY CONTROL
            # We run ML on every frame for the first 5 frames of a track (burst)
            # and then once every 30 frames if it remains "Unknown".
            rec_count = self.track_rec_frames.get(track_id, 0)
            if rec_count >= 5 and rec_count % 30 != 0:
                self.track_rec_frames[track_id] = rec_count + 1
                return frame, [], []
            
            self.track_rec_frames[track_id] = rec_count + 1

        target_img = detection_frame if detection_frame is not None else frame
        
        # detection: (name, emp_id, score, (x, y, w, h))
        detection_results = recognition.identify_faces(target_img, is_crop=(detection_frame is not None))
        
        events = []
        bounding_boxes = []
        current_time = time.time()

        for name, emp_id, score, (x, y, w, h) in detection_results:
            color = (0, 255, 0) if (name != "Unknown" and "Visitor" not in name) else (0, 0, 255)
            
            # Format label
            if "Visitor" in name:
                display_label = name # e.g. "Visitor #101"
            elif name == "Unknown":
                display_label = "Unknown Face"
            elif emp_id is not None:
                display_label = f"{name} (ID: {emp_id}) Face"
            else:
                display_label = f"{name} Face"

            # Link to Track ID via IntegrationService if info provided
            if track_id:
                from utils.integration_service import integration_service
                logger.debug(f"FaceRec: Updating Identity for Track {track_id} -> {display_label}")
                integration_service.update_identity(track_id, display_label)

            # For integrated mode, run_ml handles drawing
            if detection_frame is None:
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, f"{display_label} ({score:.2f})", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
            bounding_boxes.append({
                "id": track_id,
                "class": display_label,
                "x": int(x), "y": int(y), "w": int(w), "h": int(h), "confidence": float(score)
            })

            # Determine Event Logic
            should_send = False
            last_time = self.last_events.get(name, 0)
            if current_time - last_time > self.THROTTLE_SECONDS:
                should_send = True
            
            if should_send and name != "Unknown" and "Visitor" not in name:
                label = "Employee Recognized"
                event = {
                    "camera_id": camera_id,
                    "module_key": "face-recognition", 
                    "label": label,
                    "confidence": float(score),
                    "timestamp": current_time,
                    "meta": f"Name: {name}, ID: {emp_id}",
                }
                events.append(event)
                self.last_events[name] = current_time

        return frame, events, bounding_boxes
