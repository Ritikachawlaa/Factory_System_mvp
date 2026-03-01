
from flask import Flask, request, jsonify
import os
import sys
import numpy as np
import cv2
import io
from PIL import Image

# Add current dir to path to import utils
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils import recognition

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "ml_api"})

@app.route('/generate_embedding', methods=['POST'])
def generate_embedding():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Read image bytes
        image_bytes = file.read()
        
        # Convert to numpy array for CV2
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({"error": "Failed to decode image"}), 400

        # Optional: Normalize to RGB if needed (DeepFace usually handles BGR too if specified, but let's be safe)
        # DeepFace.represent takes BGR natively if passed as numpy
        
        # Call the existing recognition utility
        # Note: In ml/utils/recognition.py it's called 'get_embedding'
        embedding = recognition.get_embedding(img)
        
        if embedding is None:
            return jsonify({"error": "No face detected in the image"}), 400
            
        return jsonify({
            "embedding": embedding,
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Load models before starting
    recognition.load_models()
    # Run on port 5174 (standardized for our ML adapter)
    app.run(host='0.0.0.0', port=5174)
