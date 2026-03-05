import time
import cv2
import logging
from utils import recognition

logger = logging.getLogger("face_recognition")


class FaceRecognitionService:
    def __init__(self):
        # Load employee name cache on startup
        recognition.load_know_faces_safe()
        self.last_events = {}  # name -> timestamp (throttle duplicate events)
        self.THROTTLE_SECONDS = 5.0
        self.track_rec_frames = {}  # track_id -> frames_since_last_recognition

    def process_frame(self, frame, camera_id=0, detection_frame=None, tracked_info=None):
        """
        Generic flow:
          1. If a face is detected in the frame, send it to AWS Rekognition.
          2. Once recognized, return the person's name.
        """
        track_id = tracked_info.get("track_id") if tracked_info else None

        # ── Optimization: skip ML if track already has a locked identity ──
        if track_id:
            from utils.integration_service import integration_service
            existing_identity = integration_service.get_identity(track_id)
            if existing_identity and "Unknown" not in existing_identity:
                integration_service.touch_identity(track_id)
                return frame, [], [{
                    "id": track_id,
                    "class": existing_identity,
                    "x": tracked_info.get("x", 0),
                    "y": tracked_info.get("y", 0),
                    "w": tracked_info.get("w", 0),
                    "h": tracked_info.get("h", 0),
                    "confidence": 1.0
                }]

            # Burst + frequency control: run ML on every frame for the first
            # 5 frames of a track, then once every 30 frames while unknown.
            rec_count = self.track_rec_frames.get(track_id, 0)
            if rec_count >= 5 and rec_count % 30 != 0:
                self.track_rec_frames[track_id] = rec_count + 1
                return frame, [], []
            self.track_rec_frames[track_id] = rec_count + 1

        # ── Choose input image ────────────────────────────────────────────
        # Prefer the full frame for higher quality face crops.
        # Only use the detection crop if it is large enough for AWS.
        target_img = frame
        use_crop = False
        if detection_frame is not None:
            try:
                h, w = detection_frame.shape[:2]
                if w >= 420 and h >= 420:
                    target_img = detection_frame
                    use_crop = True
            except Exception:
                pass

        # ── Run recognition (generic AWS flow inside) ─────────────────────
        detection_results = recognition.identify_faces(target_img, is_crop=use_crop)

        events = []
        bounding_boxes = []
        current_time = time.time()

        for name, emp_id, score, (x, y, w, h) in detection_results:
            # Format display label
            if name == "Unknown":
                display_label = "Unknown Face"
            elif emp_id is not None:
                display_label = f"{name} (ID: {emp_id}) Face"
            else:
                display_label = f"{name} Face"

            # Link to Track ID via IntegrationService
            if track_id:
                from utils.integration_service import integration_service
                logger.debug(f"Updating identity for Track {track_id} -> {display_label}")
                integration_service.update_identity(track_id, display_label)

            # Drawing (standalone mode only)
            if detection_frame is None:
                color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, f"{display_label} ({score:.2f})",
                            (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            bounding_boxes.append({
                "id": track_id,
                "class": display_label,
                "x": int(x), "y": int(y), "w": int(w), "h": int(h),
                "confidence": float(score)
            })

            # Event throttle
            last_time = self.last_events.get(name, 0)
            if (current_time - last_time > self.THROTTLE_SECONDS
                    and name != "Unknown"):
                events.append({
                    "camera_id": camera_id,
                    "module_key": "face-recognition",
                    "label": "Employee Recognized",
                    "confidence": float(score),
                    "timestamp": current_time,
                    "meta": f"Name: {name}, ID: {emp_id}",
                })
                self.last_events[name] = current_time

        return frame, events, bounding_boxes
