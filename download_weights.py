import urllib.request
import os

WEIGHTS_DIR = "backend/weights"
if not os.path.exists(WEIGHTS_DIR):
    os.makedirs(WEIGHTS_DIR)

files = {
    "face_detection_yunet_2023mar.onnx": "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx",
    "face_recognition_sface_2021dec.onnx": "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"
}

for filename, url in files.items():
    path = os.path.join(WEIGHTS_DIR, filename)
    if not os.path.exists(path):
        print(f"Downloading {filename}...")
        try:
            urllib.request.urlretrieve(url, path)
            print(f"Downloaded {filename}")
        except Exception as e:
            print(f"Failed to download {filename}: {e}")
    else:
        print(f"{filename} already exists.")
