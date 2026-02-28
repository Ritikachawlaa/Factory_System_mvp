from ultralytics import YOLO
import cv2
import os

def test_face_model():
    model_path = os.path.abspath(os.path.join(os.getcwd(), 'ml', 'models', 'Core_Model_1.pt'))
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}")
        return

    print(f"Loading model from {model_path}...")
    model = YOLO(model_path)
    
    # Use zidane.jpg for testing
    import ultralytics
    image_path = os.path.join(os.path.dirname(ultralytics.__file__), "assets", "zidane.jpg")
    
    print(f"Running inference on {image_path}...")
    results = model(image_path, conf=0.3)[0]
    
    print(f"Found {len(results.boxes)} detections.")
    for i, box in enumerate(results.boxes):
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        conf = float(box.conf[0])
        cls = int(box.cls[0])
        print(f"Detection {i+1}: Class={cls}, Box=[{x1}, {y1}, {x2}, {y2}], Conf={conf:.2f}")

if __name__ == "__main__":
    test_face_model()
