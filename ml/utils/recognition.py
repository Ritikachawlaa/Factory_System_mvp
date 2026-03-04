import cv2
import numpy as np
# import database
import pickle
import os
import logging
import requests
from deepface import DeepFace

logger = logging.getLogger("recognition")

# Global State
known_face_encodings = []
known_face_names = []
known_face_ids = []

# Gallery State
gallery_face_encodings = []
gallery_face_ids = []
gallery_face_names = [] # Usually placeholders like "Gallery #101"
latest_accuracy = 0.0
latest_latency = 0.0

from config import BACKEND_API_URL, MODEL_NAME

BACKEND_URL = BACKEND_API_URL
AWS_FIRST_RECOGNITION = os.getenv("AWS_FIRST_RECOGNITION", "true").lower() == "true"


def load_known_faces():
    """
    Load faces from the Backend API.
    """
    global known_face_encodings, known_face_names, known_face_ids
    global gallery_face_encodings, gallery_face_ids, gallery_face_names
    print("ML: Loading known faces and gallery from Backend API...")
    try:
        url = f"{BACKEND_URL}/api/ml/initial-state"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        employees = data.get("employees", [])
        gallery = data.get("gallery", [])
        
        # Load Employees
        known_face_encodings = []
        known_face_names = []
        known_face_ids = []
        for e in employees:
            known_face_encodings.append(e["embedding"])
            known_face_names.append(e["name"])
            known_face_ids.append(e["id"])
            
        # Load Gallery
        gallery_face_encodings = []
        gallery_face_ids = []
        gallery_face_names = []
        for g in gallery:
            gallery_face_encodings.append(g["embedding"])
            gallery_face_ids.append(g["id"])
            # If name is null, use a placeholder
            name = g["name"] if g["name"] else f"Visitor #{g['id']}"
            gallery_face_names.append(name)
            
        print(f"ML: Loaded {len(known_face_names)} employees and {len(gallery_face_names)} gallery faces.")
        logger.info(f"ML: Loaded {len(known_face_names)} employees and {len(gallery_face_names)} gallery faces.")
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
            enforce_detection=True, # Strict for registration
            align=True # Ensure consistent alignment with inference
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

def identify_faces(frame, is_crop=False):
    """
    Returns list of (name, id, score, (x, y, w, h))
    """
    global known_face_encodings, known_face_names, known_face_ids
    
    detections = []
    
    # DeepFace handles BGR to RGB conversion internally for numpy arrays
    # Manual conversion causes double-swapping and low accuracy
    logger.info(f"identify_faces called. Frame shape: {frame.shape}, is_crop: {is_crop}")
    
    try:
        # Try a more robust detector first (mediapipe is very fast and accurate for faces)
        # retinaface is the most accurate but slower
        results = None
        for backend in ['retinaface', 'mediapipe', 'opencv']:
            try:
                results = DeepFace.represent(
                    img_path=frame, 
                    model_name=MODEL_NAME,
                    enforce_detection=False,
                    detector_backend=backend,
                    align=True
                )
                if results and len(results) > 0:
                    # Check if it actually found a facial area
                    total_area = frame.shape[0] * frame.shape[1]
                    region = results[0]["facial_area"]
                    found_area = region['w'] * region['h']
                    
                    # If it basically returns the whole image, it likely failed detection (when enforce_detection=False)
                    if is_crop or found_area < total_area * 0.8:
                        logger.info(f"ML: Detected {len(results)} faces using {backend} backend.")
                        break
                    else:
                        logger.warning(f"ML: Backend {backend} found area {found_area}/{total_area} ({(found_area/total_area)*100:.1f}%) - likely fake detection. Trying next.")
                        results = None
            except Exception as e:
                logger.debug(f"Detector {backend} failed: {e}")
                continue

        if not results:
            return []
        
        for res in results:
            embedding = res["embedding"]
            region = res["facial_area"]
            
            # Match
            name = "Unknown"
            emp_id = None
            best_score = 0.0
            
            # If facial area is basically the whole frame and enforce_detection=False,
            # it means NO face was actually found.
            total_area = frame.shape[0] * frame.shape[1]
            if not is_crop and (region['w'] * region['h']) > (total_area * 0.95):
                logger.warning("Skipping match because area is too large (likely no face found)")
                continue

            # AWS-first architecture:
            # Detect face locally, then match against Rekognition collection.
            aws_found = False
            if AWS_FIRST_RECOGNITION and name == "Unknown":
                try:
                    from .aws_face_service import aws_face_service
                    face_crop = frame[int(region['y']):int(region['y']+region['h']),
                                      int(region['x']):int(region['x']+region['w'])]
                    if face_crop.size > 0:
                        success, buffer = cv2.imencode(".jpg", face_crop)
                        if success:
                            aws_match = aws_face_service.search_face(buffer.tobytes(), threshold=60)
                            if aws_match:
                                emp_id_aws = int(aws_match['external_id'])
                                if emp_id_aws not in known_face_ids:
                                    # Reload in case employee cache is stale
                                    load_know_faces_safe()
                                if emp_id_aws in known_face_ids:
                                    idx = known_face_ids.index(emp_id_aws)
                                    name = known_face_names[idx]
                                else:
                                    name = f"Employee #{emp_id_aws}"
                                emp_id = emp_id_aws
                                best_score = float(aws_match['confidence'])
                                aws_found = True
                                logger.info(f"AWS Match: {name} ({best_score:.2f})")
                except Exception as e:
                    logger.debug(f"AWS Search skip: {e}")

            # Optional local fallback only when AWS doesn't match.
            if name == "Unknown" and not aws_found and len(known_face_encodings) > 0:
                a = np.array(embedding).flatten()
                for i, known_emb in enumerate(known_face_encodings):
                    b = np.array(known_emb).flatten()
                    score = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
                    logger.debug(f"Comparing with Employee {known_face_names[i]}: Score={score:.4f}")
                    if score > best_score and score > 0.20:
                        best_score = score
                        name = known_face_names[i]
                        emp_id = known_face_ids[i]
            
            # 2. Try Gallery Match if no employee found
            if name == "Unknown" and not aws_found and len(gallery_face_encodings) > 0:
                a = np.array(embedding).flatten()
                for i, gall_emb in enumerate(gallery_face_encodings):
                    b = np.array(gall_emb).flatten()
                    score = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
                    # LOG
                    logger.debug(f"Comparing with Gallery {gallery_face_names[i]}: Score={score:.4f}")
                    if score > best_score and score > 0.25: # Lowered to 0.25
                        best_score = score
                        name = gallery_face_names[i]
                        # emp_id remains None

            # 3. Try AWS Rekognition for unresolved faces (independent of gallery size)
            if name == "Unknown":
                try:
                    from .aws_face_service import aws_face_service
                    face_crop = frame[int(region['y']):int(region['y']+region['h']),
                                      int(region['x']):int(region['x']+region['w'])]
                    if face_crop.size > 0:
                        success, buffer = cv2.imencode(".jpg", face_crop)
                        if success:
                            aws_match = aws_face_service.search_face(buffer.tobytes())
                            if aws_match:
                                emp_id_aws = int(aws_match['external_id'])
                                if emp_id_aws in known_face_ids:
                                    idx = known_face_ids.index(emp_id_aws)
                                    name = known_face_names[idx]
                                    emp_id = emp_id_aws
                                    best_score = aws_match['confidence']
                                    logger.info(f"AWS Match: {name} ({best_score:.2f})")
                                else:
                                    logger.info(f"AWS matched employee id {emp_id_aws}, but it is not loaded in ML known_face_ids.")
                except Exception as e:
                    logger.debug(f"AWS Search skip: {e}")

            if name != "Unknown":
                logger.info(f"ML Face Match: SUCCESS! Name={name}, Score={best_score:.4f}")
            else:
                # 4. New Face Discovery: Send to backend gallery
                logger.info(f"ML Face Match: DISCOVERY. Best score was {best_score:.4f}. Sending to Gallery.")
                try:
                    requests.post(f"{BACKEND_URL}/api/ml/gallery/upsert", json={
                        "embedding": embedding,
                        "meta": {"is_discovery": True}
                    }, timeout=1)
                except Exception as e:
                    logger.warning(f"ML Gallery Upsert Failed: {e}")
            
            x = int(region['x'])
            y = int(region['y'])
            w = int(region['w'])
            h = int(region['h'])
            
            detections.append((name, emp_id, best_score, (x, y, w, h)))
            
    except Exception as e:
        logger.error(f"Main detector block failed: {type(e).__name__} - {e}")
        # Fallback to opencv if retinaface fails
        try:
             results = DeepFace.represent(
                img_path=frame, # Pass original BGR frame
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
                    a = np.array(embedding).flatten()
                    for i, known_emb in enumerate(known_face_encodings):
                        b = np.array(known_emb).flatten()
                        score = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
                        
                        # TWEAK: Lowered to 0.25 for consistency
                        if score > best_score and score > 0.25: 
                            best_score = score
                            name = known_face_names[i]
                            emp_id = known_face_ids[i]
                
                if name != "Unknown":
                    logger.info(f"ML Face Match: SUCCESS! Name={name}, Score={best_score:.4f}")
                else:
                    logger.info(f"ML Face Match: UNKNOWN. Local Best Score: {best_score:.4f} (Threshold: 0.25)")
                detections.append((name, emp_id, best_score, (int(region['x']), int(region['y']), int(region['w']), int(region['h']))))
        except:
            pass
        
    return detections

def recognize_faces(frame):
    detections = identify_faces(frame)
    for name, emp_id, score, (x, y, w, h) in detections:
        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
        label = f"{name} (ID: {emp_id})" if emp_id else name
        cv2.putText(frame, f"{label} ({score:.2f})", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    return frame
