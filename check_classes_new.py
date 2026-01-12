from ultralytics import YOLO
import os

model_path = "backend/weights/best_ppe.pt"
if os.path.exists(model_path):
    model = YOLO(model_path)
    print("Class Names:", model.names)
else:
    print("Model not found at", model_path)
