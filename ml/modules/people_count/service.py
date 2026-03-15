import cv2
import logging
import time
from .detector import PersonDetector

logger = logging.getLogger("people_count")

class PeopleCountService:
    def __init__(self):
        self.detector = PersonDetector()
        self.last_count = 0
        self.last_log_time = 0
        self.LOG_INTERVAL = 10 # Log every 10 seconds if count significant

    def process_frame(self, frame, camera_id=0):
        now = time.time()
        boxes = self.detector.detect(frame)
        count = len(boxes)
        events = []
        boxes_output = []
        
        # Draw on frame
        for (x1, y1, x2, y2) in boxes:
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
            boxes_output.append({
                "class": "person",  # Or whatever matches VideoFeed filter
                "x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1), "confidence": 1.0
            })
        
        cv2.putText(frame, f"People Count: {count}", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        # Event Logic: Log periodically or on significant change
        if (count > 0 and now - self.last_log_time > 5.0) or (abs(count - self.last_count) > 0):
            event = {
                "camera_id": camera_id,
                "module_key": "people-count",
                "label": "People Count Update",
                "confidence": 1.0,
                "timestamp": now,
                "meta": {
                    "message": f"Detected: {count} people",
                    "count": count,
                    "previous_count": self.last_count
                }
            }
            events.append(event)
            self.last_log_time = now
            self.last_count = count

        return frame, events, boxes_output
