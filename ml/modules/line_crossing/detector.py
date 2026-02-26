from ultralytics import YOLO

class PersonDetector:

    def __init__(self, model_path):
        self.model = YOLO(model_path)

    def detect(self, frame):
        # results = self.model(frame) # source had verbose=False
        results = self.model(frame, conf=0.25, verbose=False)[0]

        boxes = []

        for box in results.boxes:
            cls = int(box.cls[0])

            # COCO class 0 = person
            if cls == 0:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                boxes.append((x1, y1, x2, y2))

        return boxes
