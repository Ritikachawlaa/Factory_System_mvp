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
    Returns (embedding, error_detail_string)
    """
    errors = []
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
            msg = "DeepFace is NOT installed on this server. Run 'pip install deepface' on the server."
            logger.error(msg)
            return None, msg

        # Convert bytes to PIL Image and normalize to RGB
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image = image.convert('RGB')
            image_np = np.array(image)
            image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
            logger.info(f"Image decoded successfully. Shape: {image_np.shape}")
        except Exception as e:
            msg = f"Failed to decode image data: {str(e)}"
            logger.error(msg)
            return None, msg
        
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
                return np.array(results[0]["embedding"]), None
        except Exception as e:
            errors.append(f"OpenCV failed: {str(e)}")
            logger.warning(errors[-1])
            
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
                return np.array(results[0]["embedding"]), None
        except Exception as e:
            errors.append(f"Retinaface failed: {str(e)}")
            logger.warning(errors[-1])

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
                return np.array(results[0]["embedding"]), None
        except Exception as e:
            errors.append(f"Relaxed failed: {str(e)}")
            logger.error(errors[-1])

        # Try 4: Absolute Last Resort - 'skip' backend
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
                return np.array(results[0]["embedding"]), None
        except Exception as e:
            errors.append(f"Skip-detector failed: {str(e)}")
            logger.error(errors[-1])

    except Exception as e:
        msg = f"CRITICAL failure in get_embedding_from_bytes: {str(e)}"
        logger.error(msg)
        import traceback
        logger.error(traceback.format_exc())
        return None, msg
    
    final_error = " | ".join(errors)
    logger.error(f"All embedding attempts failed: {final_error}")
    return None, f"All detection methods failed. Errors: {final_error}"

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
