from huggingface_hub import list_repo_files

repos = [
    "Tanishjain9/yolov8n-ppe-detection-6classes",
    "keremberke/yolov8n-protective-equipment-detection",
    "keremberke/yolov8n-hard-hat-detection"
]

for repo in repos:
    print(f"\nScanning {repo}...")
    try:
        files = list_repo_files(repo)
        for f in files:
            if f.endswith(".onnx"):
                print(f"FOUND ONNX: {f} in {repo}")
    except Exception as e:
        print(f"Error: {e}")
