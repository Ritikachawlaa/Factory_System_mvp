import requests
import os
import logging

# Setup logger
logger = logging.getLogger("recognition")

# ML API URL from environment (defaults to our identified ML instance)
ML_API_URL = os.getenv("ML_API_URL", "http://98.88.233.228:5174")

def load_known_faces():
    """STUB: Faces loaded by ML engine independently."""
    pass

def load_models():
    """STUB: Models loaded on remote ML Instance."""
    pass

def get_embedding_from_bytes(image_bytes):
    """
    Generate embedding for a single face image by calling the remote ML service.
    Returns (embedding, error_detail_string)
    """
    try:
        logger.info(f"Requesting remote embedding from {ML_API_URL}")
        
        # Prepare file for requests
        files = {'file': ('face.jpg', image_bytes, 'image/jpeg')}
        
        # Call the remote ML API
        response = requests.post(
            f"{ML_API_URL}/generate_embedding", 
            files=files, 
            timeout=15 # Longer timeout for heavy ML processing
        )
        
        if response.status_code == 200:
            data = response.json()
            logger.info("Remote embedding generation successful.")
            return data["embedding"], None
        else:
            try:
                error_msg = response.json().get("error", "Unknown error")
            except:
                error_msg = response.text
                
            logger.warning(f"Remote ML Error: {error_msg}")
            return None, f"ML Instance Error: {error_msg}"

    except Exception as e:
        logger.error(f"Failed to connect to ML Instance: {str(e)}")
        return None, f"Connection Failed to ML Instance at {ML_API_URL}. Ensure ML-API is running."

def process_frame(frame, modules=None):
    # Backend processing is NO LONGER DONE LOCALLY.
    # It delegates to separate ML service.
    return frame

def identify_faces(frame):
    # STUB
    return []

def recognize_faces(frame):
    # STUB
    return frame
