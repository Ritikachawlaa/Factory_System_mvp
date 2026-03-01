import cv2
import numpy as np
# import database
import pickle
import os
import requests
from deepface import DeepFace

# Global State
known_face_encodings = []
known_face_names = []
known_face_ids = []
latest_accuracy = 0.0
latest_latency = 0.0

from config import BACKEND_API_URL, MODEL_NAME

BACKEND_URL = BACKEND_API_URL


def load_known_faces():
    """
    Load faces from the Backend API.
    """
    global known_face_encodings, known_face_names, known_face_ids
    print("ML: Loading known faces from Backend API...")
    try:
        url = f"{BACKEND_URL}/api/ml/initial-state"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        employees = data.get("employees", [])
        
        known_face_encodings = []
        known_face_names = []
        known_face_ids = []
        
        for e in employees:
            name = e["name"]
            emp_id = e["id"]
            embedding = e["embedding"]
            # embedding comes as list from JSON
            known_face_encodings.append(embedding)
            known_face_names.append(name)
            known_face_ids.append(emp_id)
            
        print(f"ML: Loaded {len(known_face_names)} faces.")
    except Exception as e:
        print(f"ML: Error loading faces: {e}")

def load_know_faces_safe():
    try:
        load_known_faces()
    except Exception as e:
        print(f"ML: Failed to load faces safe: {e}")

def load_models():
    """
    Pre-warm DeepFace model.
    """
    print("ML: Pre-loading DeepFace model...")
    try:
        # Perform a dummy representation to load weights
        dummy_img = np.zeros((160, 160, 3), dtype=np.uint8)
        DeepFace.represent(dummy_img, model_name=MODEL_NAME, enforce_detection=False)
        print("ML: DeepFace model loaded.")
        load_known_faces()
    except Exception as e:
        print(f"ML: Model load failed: {e}")

def get_embedding(image_data):
    """
    Generate embedding for a single face image.
    """
    try:
        results = DeepFace.represent(
            img_path=image_data,
            model_name=MODEL_NAME,
            enforce_detection=True # Strict for registration
        )
        if results:
            return results[0]["embedding"]
    except Exception as e:
        print(f"Embedding Error: {e}")
    return None

def process_frame(frame, modules=None):
    if modules is None:
        modules = []
    
    run_face_rec = False
    for m in modules:
        if 'face' in m.lower():
            run_face_rec = True
            break
            
    if run_face_rec:
        return recognize_faces(frame)
        
    return frame

def identify_faces(frame):
    """
    Returns list of (name, id, score, (x, y, w, h))
    """
    global known_face_encodings, known_face_names, known_face_ids
    
    detections = []
    
    # Use the full frame for better accuracy
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    try:
        # Retinaface is much more robust for finding faces than opencv
        results = DeepFace.represent(
            img_path=rgb_frame,
            model_name=MODEL_NAME,
            enforce_detection=False,
            detector_backend='retinaface'
        )
        
        for res in results:
            embedding = res["embedding"]
            region = res["facial_area"]
            
            # Match
            name = "Unknown"
            emp_id = None
            best_score = 0.0
            
            if len(known_face_encodings) > 0:
                a = np.array(embedding)
                for i, known_emb in enumerate(known_face_encodings):
                    b = np.array(known_emb)
                    # Cosine Similarity
                    score = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
                    # Threshold: 0.35
                    if score > best_score and score > 0.35: 
                        best_score = score
                        name = known_face_names[i]
                        emp_id = known_face_ids[i]
            
            x = int(region['x'])
            y = int(region['y'])
            w = int(region['w'])
            h = int(region['h'])
            
            detections.append((name, emp_id, best_score, (x, y, w, h)))
            
    except Exception as e:
        # Fallback to opencv if retinaface fails
        try:
             results = DeepFace.represent(
                img_path=rgb_frame,
                model_name=MODEL_NAME,
                enforce_detection=False,
                detector_backend='opencv'
            )
             for res in results:
                embedding = res["embedding"]
                region = res["facial_area"]
                name = "Unknown"
                emp_id = None
                best_score = 0.0
                if len(known_face_encodings) > 0:
                    a = np.array(embedding)
                    for i, known_emb in enumerate(known_face_encodings):
                        b = np.array(known_emb)
                        score = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
                        if score > best_score and score > 0.35: 
                            best_score = score
                            name = known_face_names[i]
                            emp_id = known_face_ids[i]
                detections.append((name, emp_id, best_score, (int(region['x']), int(region['y']), int(region['w']), int(region['h']))))
        except:
            pass
        
    return detections

def recognize_faces(frame):
    detections = identify_faces(frame)
    for name, score, (x, y, w, h) in detections:
        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
        cv2.putText(frame, f"{name} ({score:.2f})", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
    return frame
