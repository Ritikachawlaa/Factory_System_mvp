import urllib.request
import os

WEIGHTS_DIR = "backend/weights"
if not os.path.exists(WEIGHTS_DIR):
    os.makedirs(WEIGHTS_DIR)

url = "https://huggingface.co/keremberke/yolov8n-protective-equipment-detection/resolve/main/best.pt"
target_path = os.path.join(WEIGHTS_DIR, "ppe.pt")

if not os.path.exists(target_path):
    print(f"Downloading PPE model from {url}...")
    try:
        urllib.request.urlretrieve(url, target_path)
        print("Download complete.")
    except Exception as e:
        print(f"Failed to download: {e}")
else:
    print("PPE model already exists.")
