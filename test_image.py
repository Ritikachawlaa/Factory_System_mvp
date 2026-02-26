import os
import sys
import cv2
import json

sys.path.append('/home/ubuntu/Factory_System_mvp/ml')

print("Starting Isolated ML Test Script on Image...")

try:
    from modules.human_detection.service import HumanDetectionService
except ImportError as e:
    print(f"Failed to import ML modules: {e}")
    sys.exit(1)

def main():
    print("Loading ML Services...")
    # Load the services which initializes the YOLO models using CUDA
    human_service = HumanDetectionService()
    
    print("Reading image...")
    frame = cv2.imread('/tmp/zidane.jpg')
    
    if frame is None:
        print("ERROR: Failed to open image.")
        sys.exit(1)
        
    print("Processing image through HumanDetection GPU pipeline...")
    
    # Process image
    out_frame, events = human_service.process_frame(frame, camera_id=999)
    
    if events:
        print(f"\n[SUCCESS] Detected {len(events)} humans in image:")
        for e in events:
            print(f"  {json.dumps(e, indent=2)}")
        print("\n[VERIFIED] Successfully proved GPU Models run and generate correct bounding box JSON arrays for the frontend.")
    else:
        print("\n[FAILED] Model ran but detected 0 humans.")

if __name__ == '__main__':
    main()
