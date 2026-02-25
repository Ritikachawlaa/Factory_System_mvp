import os

filepath = "/home/ubuntu/Factory_System_mvp/backend/main.py"
try:
    with open(filepath, "r") as f:
        content = f.read()

    # 1. Add logging to broadcast_detection_stream
    if "Backend Forwarding: Received" not in content:
        content = content.replace(
            "last_detection_time[payload.camera_id] = time.time()",
            'last_detection_time[payload.camera_id] = time.time()\n        print(f"Backend Forwarding: Received {len(payload.detections)} detections for Camera {payload.camera_id}")\n        logger.info(f"Backend Forwarding: Received {len(payload.detections)} detections for Camera {payload.camera_id}")'
        )

    # 2. Add logging to DetectionConnectionManager broadcast
    if "Backend Forwarding: Sent payload" not in content:
        content = content.replace(
            "await connection.send_text(json.dumps(message))",
            'await connection.send_text(json.dumps(message))\n                print(f"Backend Forwarding: Sent payload to user {username}")'
        )

    with open(filepath, "w") as f:
        f.write(content)
        
    print("Updated backend/main.py with requested logging flags.")

except Exception as e:
    print(f"Failed to patch backend main.py: {e}")
