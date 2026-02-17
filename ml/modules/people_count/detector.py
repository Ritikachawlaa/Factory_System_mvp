import os
from ultralytics import YOLO

class PersonDetector:
    def __init__(self, model_path="ml/models/Core_Model_1.pt"):
        # Fallback to standard yolov8n if core model not found (though we just copied it)
        if not os.path.exists(model_path):
            model_path = "yolov8n.pt"
        self.model = YOLO(model_path)

    def detect(self, frame):
        # Class 0 is usually person in COCO/YOLO
        results = self.model(frame, conf=0.4, verbose=False)[0]
        boxes = []
        for box in results.boxes:
            cls = int(box.cls[0])
            if cls == 0:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                boxes.append((x1, y1, x2, y2))
        return boxes
