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
    try:
        import cv2
        import numpy as np
        from PIL import Image
        import io
        
        # Check if deepface is installed
        try:
            from deepface import DeepFace
        except ImportError:
            logger.error("DeepFace is NOT installed on this server. Cannot generate embeddings.")
            return None

        # Convert bytes to PIL Image and normalize to RGB
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert('RGB') # Fix: Standardize to RGB (drops alpha channel if any)
        image_np = np.array(image)
        
        # Convert RGB to BGR for OpenCV/DeepFace
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        
        logger.info(f"Generating embedding for image size {image_np.shape}")

        # Try 1: OpenCV (Fast)
        try:
            results = DeepFace.represent(
                img_path=image_bgr,
                model_name=MODEL_NAME,
                enforce_detection=True,
                detector_backend='opencv'
            )
            if results:
                return np.array(results[0]["embedding"])
        except Exception as e:
            logger.warning(f"OpenCV face detection failed: {str(e)}")
            
        # Try 2: Retinaface (Robust)
        try:
            results = DeepFace.represent(
                img_path=image_bgr,
                model_name=MODEL_NAME,
                enforce_detection=True,
                detector_backend='retinaface'
            )
            if results:
                return np.array(results[0]["embedding"])
        except Exception as e:
            logger.warning(f"Retinaface face detection failed: {str(e)}")

        # Try 3: Last Resort - Relaxed Detection (returns embedding regardless of face found)
        # We only do this if prior attempts failed but we want to be helpful
        try:
            logger.warning("Attempting relaxed detection (enforce_detection=False)")
            results = DeepFace.represent(
                img_path=image_bgr,
                model_name=MODEL_NAME,
                enforce_detection=False,
                detector_backend='opencv'
            )
            if results:
                logger.info("Generated embedding using relaxed detection.")
                return np.array(results[0]["embedding"])
        except Exception as e:
            logger.error(f"Relaxed detection also failed: {str(e)}")

    except Exception as e:
        logger.error(f"Critical error generating embedding: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
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
