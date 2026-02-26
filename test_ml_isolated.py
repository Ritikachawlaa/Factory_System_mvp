import os
import sys
import cv2
import time
import json

# Add the ML directory to the Python path
sys.path.append('/home/ubuntu/Factory_System_mvp/ml')

print("Starting Isolated ML Test Script...")

try:
    from modules.people_count.service import PeopleCountService
    from modules.human_detection.service import HumanDetectionService
except ImportError as e:
    print(f"Failed to import ML modules: {e}")
    sys.exit(1)

def main():
    print("Loading ML Services...")
    # Load the services which initializes the YOLO models using CUDA
    people_service = PeopleCountService()
    
    print("Connecting to local RTMP stream (camera1)...")
    # Attach to the test stream being fed by FFmpeg
    cap = cv2.VideoCapture('rtmp://localhost:1935/camera1')
    
    if not cap.isOpened():
        print("ERROR: Failed to open RTMP stream. Is MediaMTX running and receiving the stream?")
        sys.exit(1)
        
    print("Stream successfully opened. Processing frames...")
    
    frame_count = 0
    total_events = 0
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to read frame from stream.")
                break
                
            frame_count += 1
            
            # Process every 10th frame to simulate real ML load and save CPU
            if frame_count % 10 == 0:
                print(f"Processing Frame {frame_count}...")
                
                # Resize to match normal ML pipeline expected dimensions
                frame_resized = cv2.resize(frame, (320, 240))
                
                # Run inference
                out_frame, events = people_service.process_frame(frame_resized, camera_id=999)
                
                if events:
                    total_events += len(events)
                    print(f"[SUCCESS] Detected {len(events)} events on Frame {frame_count}:")
                    for e in events:
                        # Print the JSON that would normally go to the backend
                        print(f"  {json.dumps(e, indent=2)}")
                        
                if total_events >= 5:
                    print("\n[VERIFIED] Successfully proved ML models process the simulated stream and output JSON. Exiting.")
                    break
                    
            if frame_count > 300:
                print("\n[TIMEOUT] Processed 300 frames but didn't consistently detect objects. The model runs, but no detections.")
                break
                
    except KeyboardInterrupt:
        print("Interrupted by user.")
    finally:
        cap.release()
        print(f"Finished. Total frames read: {frame_count}, Total events generated: {total_events}")

if __name__ == '__main__':
    main()
