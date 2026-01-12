import urllib.request
import os

WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "backend", "weights")
if not os.path.exists(WEIGHTS_DIR):
    os.makedirs(WEIGHTS_DIR)

url = "https://huggingface.co/Bingsu/adetailer/resolve/main/hand_yolov8n.pt"
target_path = os.path.join(WEIGHTS_DIR, "hand_yolov8n.pt")

if not os.path.exists(target_path):
    print(f"Downloading Hand model from {url}...")
    try:
        urllib.request.urlretrieve(url, target_path)
        print("Download complete.")
    except Exception as e:
        print(f"Failed to download: {e}")
else:
    print("Hand model already exists.")
