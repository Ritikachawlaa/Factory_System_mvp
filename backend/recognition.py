import requests
import os
import logging

# Setup logger
logger = logging.getLogger("recognition")

# ML API URL from environment (defaults to our identified ML instance)
ML_API_URL = os.getenv("ML_API_URL", "http://98.88.233.228:5174")

def load_known_faces():
    """
    Signal the remote ML engine to reload known faces from the database.
    """
    try:
        logger.info(f"Triggering face reload on ML Instance at {ML_API_URL}")
        response = requests.post(f"{ML_API_URL}/reload_faces", timeout=5)
        if response.status_code == 200:
            logger.info("ML Instance successfully reloaded faces.")
            return True
        else:
            logger.warning(f"ML Instance reload failed: {response.text}")
    except Exception as e:
        logger.error(f"Failed to trigger face reload on ML Instance: {e}")
    return False

def load_models():
    """STUB: Models loaded on remote ML Instance."""
    pass

def get_embedding_from_bytes(image_bytes):
    """
    Generate embedding for a single face image by calling the remote ML service.
    Returns (embedding, error_detail_string)
    """
    try:
        # We now use AWS Rekognition exclusively. 
        # The local ML instance embedding is obsolete, but the DB schema 
        # still expects a pickled numpy array. We return a dummy array 
        # to satisfy the database without needing the slow/fragile ML API.
        import numpy as np
        dummy_embedding = [0.0] * 512
        return dummy_embedding, None
    except Exception as e:
        logger.error(f"Error creating dummy embedding: {str(e)}")
        return None, f"Internal Error: {str(e)}"

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
