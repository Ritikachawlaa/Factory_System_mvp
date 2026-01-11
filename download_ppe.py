import urllib.request
import os

WEIGHTS_DIR = "backend/weights"
if not os.path.exists(WEIGHTS_DIR):
    os.makedirs(WEIGHTS_DIR)

# Possible filenames to try
urls = [
    "https://huggingface.co/Tanishjain9/yolov8n-ppe-detection-6classes/resolve/main/best.onnx",
    "https://huggingface.co/Tanishjain9/yolov8n-ppe-detection-6classes/resolve/main/model.onnx",
    "https://huggingface.co/Tanishjain9/yolov8n-ppe-detection-6classes/resolve/main/yolov8n.onnx"
]

target_path = os.path.join(WEIGHTS_DIR, "ppe_yolov8n.onnx")

if os.path.exists(target_path):
    print("PPE model already exists.")
else:
    for url in urls:
        print(f"Trying {url}...")
        try:
            urllib.request.urlretrieve(url, target_path)
            # Check if file is small (HTML error page)
            if os.path.getsize(target_path) < 10000:
                print("Downloaded file too small, likely error page. Deleting...")
                os.remove(target_path)
                continue
            print(f"Success! Downloaded to {target_path}")
            break
        except Exception as e:
            print(f"Failed: {e}")
