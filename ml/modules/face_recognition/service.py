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

    def process_frame(self, frame, camera_id=0):
        # detection: (name, score, (x, y, w, h))
        detection_results = recognition.identify_faces(frame)
        events = []
        current_time = time.time()

        for name, score, (x, y, w, h) in detection_results:
            # Draw on frame
            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            cv2.putText(frame, f"{name} ({score:.2f})", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

            # Determine Event Logic
            should_send = False
            last_time = self.last_events.get(name, 0)
            if current_time - last_time > self.THROTTLE_SECONDS:
                should_send = True
            
            if should_send:
                label = "Unknown Person" if name == "Unknown" else "Employee Recognized"
                # severity = "critical" if name == "Unknown" else "info"
                
                event = {
                    "camera_id": camera_id,
                    "module_key": "face_rec", 
                    "label": label,
                    "confidence": float(score),
                    "timestamp": current_time,
                    "meta": f"Name: {name}",
                }
                events.append(event)
                self.last_events[name] = current_time

        return frame, events
