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
            logger.info(f"DeepFace version: {getattr(DeepFace, '__version__', 'unknown')}")
        except ImportError:
            logger.error("DeepFace is NOT installed on this server. Cannot generate embeddings.")
            return None

        # Convert bytes to PIL Image and normalize to RGB
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image = image.convert('RGB')
            image_np = np.array(image)
            image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
            logger.info(f"Image decoded successfully. Shape: {image_np.shape}")
        except Exception as e:
            logger.error(f"Failed to decode image: {str(e)}")
            return None
        
        # Try 1: OpenCV (Fast)
        try:
            logger.info("Attempt 1: OpenCV detector...")
            results = DeepFace.represent(
                img_path=image_bgr,
                model_name=MODEL_NAME,
                enforce_detection=True,
                detector_backend='opencv'
            )
            if results and len(results) > 0:
                logger.info("OpenCV detection successful.")
                return np.array(results[0]["embedding"])
        except Exception as e:
            logger.warning(f"Attempt 1 (OpenCV) failed: {str(e)}")
            
        # Try 2: Retinaface (Robust)
        try:
            logger.info("Attempt 2: Retinaface detector...")
            results = DeepFace.represent(
                img_path=image_bgr,
                model_name=MODEL_NAME,
                enforce_detection=True,
                detector_backend='retinaface'
            )
            if results and len(results) > 0:
                logger.info("Retinaface detection successful.")
                return np.array(results[0]["embedding"])
        except Exception as e:
            logger.warning(f"Attempt 2 (Retinaface) failed: {str(e)}")

        # Try 3: Relaxed Detection (returns embedding regardless of face found)
        try:
            logger.info("Attempt 3: Relaxed Detection (enforce_detection=False)...")
            results = DeepFace.represent(
                img_path=image_bgr,
                model_name=MODEL_NAME,
                enforce_detection=False,
                detector_backend='opencv'
            )
            if results and len(results) > 0:
                logger.info("Relaxed detection successful.")
                return np.array(results[0]["embedding"])
        except Exception as e:
            logger.error(f"Attempt 3 (Relaxed) failed: {str(e)}")

        # Try 4: Absolute Last Resort - skip detection entirely if the library supports it or try 'skip' backend
        try:
            logger.info("Attempt 4: 'skip' detector backend...")
            results = DeepFace.represent(
                img_path=image_bgr,
                model_name=MODEL_NAME,
                enforce_detection=False,
                detector_backend='skip'
            )
            if results and len(results) > 0:
                logger.info("Skip-detector successful.")
                return np.array(results[0]["embedding"])
        except Exception as e:
            logger.error(f"Attempt 4 (Skip) failed: {str(e)}")

    except Exception as e:
        logger.error(f"CRITICAL failure in get_embedding_from_bytes: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
    
    logger.error("All embedding attempts failed. Returning None.")
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
