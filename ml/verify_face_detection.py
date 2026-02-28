import cv2
import os
import sys

# Add the ml directory to the path so we can import the module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.modules.face_detection.detector import FaceDetector

def test_face_detection():
    # Use the sample image from ultralytics
    import ultralytics
    image_path = os.path.join(os.path.dirname(ultralytics.__file__), "assets", "zidane.jpg")
    
    if not os.path.exists(image_path):
        print(f"Error: Could not find test image {image_path}")
        return

    print(f"Testing face detection on {image_path}...")
    
    detector = FaceDetector(conf=0.3)
    frame = cv2.imread(image_path)
    
    if frame is None:
        print(f"Error: Could not read image {image_path}")
        return
        
    detections = detector.detect(frame)
    
    print(f"Found {len(detections)} faces.")
    for i, (x, y, w, h, conf) in enumerate(detections):
        print(f"Face {i+1}: Box=[{x}, {y}, {w}, {h}], Conf={conf:.2f}")

if __name__ == "__main__":
    test_face_detection()
