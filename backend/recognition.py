import logging
# import cv2
# import numpy as np
# Stubbed for Backend separation from ML
# import database
# import pickle
# from deepface import DeepFace

logger = logging.getLogger("recognition")

# Global State
known_face_encodings = []
known_face_names = []
latest_accuracy = 0.0
latest_latency = 0.0

MODEL_NAME = "Facenet"

def load_known_faces():
    """
    Load faces from the SQLite database.
    STUB: No-op
    """
    logger.warning("ML Separation: load_known_faces called on Backend (Non-ML node). Skipping.")
    pass

def load_models():
    """
    Pre-warm DeepFace model.
    STUB: No-op
    """
    logger.warning("ML Separation: load_models called on Backend (Non-ML node). Skipping.")
    pass

def get_embedding_from_bytes(image_bytes):
    """
    Generate embedding for a single face image from bytes.
    STUB: Returns None
    """
    logger.warning("ML Separation: get_embedding_from_bytes called on Backend. ML service required for registration.")
    return None

def process_frame(frame, modules=None):
    # STUB
    return frame

def identify_faces(frame):
    """
    Returns list of (name, score, (x, y, w, h))
    STUB
    """
    return []

def recognize_faces(frame):
    # STUB
    return frame
