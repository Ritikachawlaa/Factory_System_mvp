import os
import re

filepath = "/home/ubuntu/Factory_System_mvp/ml/run_ml.py"

with open(filepath, "r") as f:
    content = f.read()

# 1. Log stream attachment
if "Stream Attachment: Starting connection" not in content:
    content = content.replace(
        "cap = cv2.VideoCapture(src_val)",
        'logger.info(f"Stream Attachment: Starting connection to stream path: {src_val} for Camera {cam_id}")\n        cap = cv2.VideoCapture(src_val)'
    )

# 2. Log frame received
if "Frame Received: Camera" not in content:
    content = content.replace(
        "frame = cv2.resize(frame, (320, 240))",
        'logger.info(f"Frame Received: Camera {cam_id} successfully captured a frame.")\n        frame = cv2.resize(frame, (320, 240))'
    )

# 3. Log inference result count
if "Inference Result Count" not in content:
    content = content.replace(
        "_, events = service.process_frame(frame, camera_id=cam_id)",
        "_, events = service.process_frame(frame, camera_id=cam_id)\n                    logger.info(f\"Inference Result Count for {key} on Camera {cam_id}: {len(events) if events else 0}\")\n                    print(f\"Detections: {events}\")"
    )

with open(filepath, "w") as f:
    f.write(content)

print("Updated run_ml.py with requested logging flags.")
