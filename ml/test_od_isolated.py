import os
import sys
import torch
import cv2
import numpy as np

# Add local path
sys.path.append('.')

from modules.object_detection.service import ObjectDetectionService

def test():
    service = ObjectDetectionService()
    # Create a frame with some content (to avoid empty frame issues)
    frame = np.zeros((640, 640, 3), dtype=np.uint8)
    cv2.putText(frame, "TESTING", (200, 200), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 2)
    
    # Try to process
    try:
        print("Processing frame 1...")
        f, e, b = service.process_frame(frame)
        print(f"Success! Found {len(b)} boxes.")
        for box in b:
            print(f"Found box: {box}")
            
        print("Processing frame 2...")
        f, e, b = service.process_frame(frame)
        print(f"Success! Found {len(b)} boxes.")
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
