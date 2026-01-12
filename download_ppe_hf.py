from huggingface_hub import hf_hub_download
import os
import shutil

REPO_ID = "Tanishjain9/yolov8n-ppe-detection-6classes"
FILENAME = "best.pt" # Usually best.pt for YOLO models in HF repos

WEIGHTS_DIR = "backend/weights"
if not os.path.exists(WEIGHTS_DIR):
    os.makedirs(WEIGHTS_DIR)

TARGET_PATH = os.path.join(WEIGHTS_DIR, "best_ppe.pt")

print(f"Downloading {FILENAME} from {REPO_ID}...")
try:
    model_path = hf_hub_download(repo_id=REPO_ID, filename=FILENAME)
    print(f"Downloaded to cache: {model_path}")
    
    # Copy to our weights dir
    shutil.copy(model_path, TARGET_PATH)
    print(f"Successfully moved to {TARGET_PATH}")
    
except Exception as e:
    print(f"Failed to download: {e}")
    print("Listing files in repo might help if filename is wrong...")
