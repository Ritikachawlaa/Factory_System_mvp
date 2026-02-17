from ultralytics import YOLO
import sys

def main():
    model_path = "C:/Users/ritik/Desktop/testing/Ai_system_phase_1_repo/Core_model_1/Core_Model_1.pt"
    try:
        model = YOLO(model_path)
        print("Model Names:", model.names)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
