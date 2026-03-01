import logging
import io

# Setup logger
logger = logging.getLogger("recognition")

# Global State (Synced from DB in recognition.py if needed, 
# but Backend primarily uses this for registration embeddings)
MODEL_NAME = "Facenet"

def load_known_faces():
    """
    STUB: Backend doesn't need to load all faces for simple registration,
    but we keep the signature for compatibility.
    """
    pass

def load_models():
    """
    Pre-warm DeepFace model on the backend for registration.
    """
    import numpy as np
    from deepface import DeepFace
    try:
        dummy_img = np.zeros((160, 160, 3), dtype=np.uint8)
        DeepFace.represent(dummy_img, model_name=MODEL_NAME, enforce_detection=False)
        logger.info("DeepFace models pre-warmed on Backend.")
    except Exception as e:
        logger.error(f"Failed to pre-warm models: {e}")

def get_embedding_from_bytes(image_bytes):
    """
    Generate embedding for a single face image from bytes using DeepFace.
    """
    import cv2
    import numpy as np
    from deepface import DeepFace
    from PIL import Image
    try:
        # Convert bytes to numpy array
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        # Convert RGB to BGR for OpenCV/DeepFace
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        
        results = DeepFace.represent(
            img_path=image_bgr,
            model_name=MODEL_NAME,
            enforce_detection=True,
            detector_backend='retinaface'
        )
        if results:
            return np.array(results[0]["embedding"])
    except Exception as e:
        logger.error(f"Error generating embedding on Backend: {e}")
        # Try fallback with simpler detector
        try:
            results = DeepFace.represent(
                img_path=image_bgr,
                model_name=MODEL_NAME,
                enforce_detection=True,
                detector_backend='opencv'
            )
            if results:
                return np.array(results[0]["embedding"])
        except:
            pass
    return None

def process_frame(frame, modules=None):
    # Backend processing is normally done via separate ML service.
    # Keeping stub for compatibility.
    return frame

def identify_faces(frame):
    # STUB
    return []

def recognize_faces(frame):
    # STUB
    return frame
