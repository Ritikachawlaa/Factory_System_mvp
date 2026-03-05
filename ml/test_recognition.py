import cv2
import sys
import logging
from utils import recognition
from modules.face_recognition.service import FaceRecognitionService

logging.basicConfig(level=logging.DEBUG)

def test():
    print("Loading models...")
    recognition.load_models()
    
    svc = FaceRecognitionService()
    
    # Create a dummy image with a face (read from a generic source or use webcam)
    print("Opening webcam...")
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    if not ret:
        print("Could not read from webcam")
        sys.exit(1)
        
    print(f"Captured frame: {frame.shape}")
    
    print("\n--- Testing bare recognition.identify_faces ---")
    detections = recognition.identify_faces(frame, is_crop=False)
    print(f"Detections: {detections}")
    
    print("\n--- Testing FaceRecognitionService.process_frame ---")
    tracked_info = {"track_id": 1}
    frame_out, events, boxes = svc.process_frame(frame.copy(), tracked_info=tracked_info)
    print(f"Events: {events}")
    print(f"Boxes: {boxes}")

if __name__ == "__main__":
    test()
