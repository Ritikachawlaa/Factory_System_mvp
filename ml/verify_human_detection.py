import cv2
import os
import sys

# Add the ml directory to the path so we can import the module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.modules.human_detection.detector import HumanDetector

def test_human_detection():
    # Use the sample image from ultralytics if available, otherwise any other image
    image_path = "zidane.jpg"
    if not os.path.exists(image_path):
        # Try to find it in site-packages
        import ultralytics
        image_path = os.path.join(os.path.dirname(ultralytics.__file__), "assets", "zidane.jpg")
    
    if not os.path.exists(image_path):
        print(f"Error: Could not find test image {image_path}")
        return

    print(f"Testing human detection on {image_path}...")
    
    detector = HumanDetector(conf=0.3)
    frame = cv2.imread(image_path)
    
    if frame is None:
        print(f"Error: Could not read image {image_path}")
        return
        
    height, width = frame.shape[:2]
    print(f"Image dimensions: {width}x{height}")
    
    detections = detector.detect(frame)
    
    print(f"Found {len(detections)} persons.")
    for i, (x1, y1, x2, y2, conf) in enumerate(detections):
        w = x2 - x1
        h = y2 - y1
        print(f"Person {i+1}: Box=[{x1}, {y1}, {x2}, {y2}], Size={w}x{h}, Conf={conf:.2f}")
        # If the box is small (like a face), it might be less than 20% of the image height.
        # Zidane is usually a full-body or upper-body shot.
        if h > height * 0.4:
            print(f"  -> SUCCESS: Box height is {h/height:.1%} of image height, likely full/upper body.")
        else:
            print(f"  -> WARNING: Box height is only {h/height:.1%} of image height, might still be face-only.")

if __name__ == "__main__":
    test_human_detection()
