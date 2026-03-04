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

    def process_frame(self, frame, camera_id=0, detection_frame=None, tracked_info=None):
        """
        Processes a frame for face recognition.
        If detection_frame is provided, it processes only that specific crop (optimized).
        If tracked_info is provided, it links the result to a Track ID.
        """
        target_img = detection_frame if detection_frame is not None else frame
        
        # detection: (name, emp_id, score, (x, y, w, h))
        detection_results = recognition.identify_faces(target_img)
        if detection_results:
            logger.info(f"FaceRecognitionService: Found {len(detection_results)} faces in frame")
        
        events = []
        bounding_boxes = []
        current_time = time.time()

        for name, emp_id, score, (x, y, w, h) in detection_results:
            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            
            # Format label - Ensure it's identifiable as a face by the frontend
            if name == "Unknown":
                display_label = "Unknown Face"
            elif emp_id is not None:
                display_label = f"{name} (ID: {emp_id}) Face"
            else:
                display_label = f"{name} Face"

            # Link to Track ID via IntegrationService if info provided
            if tracked_info and "track_id" in tracked_info:
                from utils.integration_service import integration_service
                integration_service.update_identity(tracked_info["track_id"], display_label)

            # Draw on frame (only if not in crop-mode or if we want to draw on the original frame)
            # For integrated mode, run_ml handles drawing
            if detection_frame is None:
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, f"{display_label} ({score:.2f})", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
            bounding_boxes.append({
                "id": tracked_info["track_id"] if tracked_info else None,
                "class": display_label,
                "x": int(x), "y": int(y), "w": int(w), "h": int(h), "confidence": float(score)
            })

            # Determine Event Logic
            should_send = False
            last_time = self.last_events.get(name, 0)
            if current_time - last_time > self.THROTTLE_SECONDS:
                should_send = True
            
            if should_send and name != "Unknown":
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
