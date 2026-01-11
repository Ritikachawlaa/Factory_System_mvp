import cv2
import numpy as np
import database
import os
import uuid
from ultralytics import YOLO

# Global cache for known faces
known_face_embeddings = []
known_face_names = []

# Paths to models
WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "weights")
face_c_path = os.path.join(WEIGHTS_DIR, "face_detection_yunet_2023mar.onnx")
face_r_path = os.path.join(WEIGHTS_DIR, "face_recognition_sface_2021dec.onnx")
ppe_path = os.path.join(WEIGHTS_DIR, "ppe.pt")

VISITORS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "visitors")
if not os.path.exists(VISITORS_DIR):
    os.makedirs(VISITORS_DIR)

# Initialize models
detector = None
recognizer = None
ppe_model = None

def load_models():
    global detector, recognizer, ppe_model
    if not os.path.exists(face_c_path) or not os.path.exists(face_r_path):
        print("Face models not found! Run download_weights.py")
        return

    # Face Models
    detector = cv2.FaceDetectorYN.create(face_c_path, "", (320, 320), 0.9, 0.3, 5000)
    recognizer = cv2.FaceRecognizerSF.create(face_r_path, "")
    
    # PPE Model (YOLOv8)
    if os.path.exists(ppe_path):
        print(f"Loading PPE Model from {ppe_path}...")
        ppe_model = YOLO(ppe_path)
    else:
        print("PPE Model weights not found, skipping PPE.")
        
    print("All models loaded.")
    load_known_faces()

def load_known_faces():
    global known_face_embeddings, known_face_names
    employees = database.get_all_employees()
    known_face_names = [e[0] for e in employees]
    known_face_embeddings = [e[1] for e in employees] 
    print(f"Loaded {len(known_face_names)} faces from database.")

def get_embedding(img_bgr):
    if detector is None:
        load_models()
        
    h, w, _ = img_bgr.shape
    detector.setInputSize((w, h)) 
    
    faces = detector.detect(img_bgr)
    if faces[1] is None:
        return None
        
    best_face = faces[1][0]
    aligned_face = recognizer.alignCrop(img_bgr, best_face)
    feature = recognizer.feature(aligned_face)
    return feature[0]

def process_frame(frame):
    if detector is None:
        load_models()
        
    h, w, _ = frame.shape
    detector.setInputSize((w, h))
    
    # --- Face Recognition ---
    faces_detected = 0
    faces = detector.detect(frame)
    if faces[1] is not None:
        faces_detected = len(faces[1])
        COSINE_THRESHOLD = 0.363 
        
        for face in faces[1]:
            coords = face[:4].astype(int)
            aligned_face = recognizer.alignCrop(frame, face)
            feature = recognizer.feature(aligned_face)
            curr_emb = feature[0]
            
            name = "Unknown"
            max_score = 0.0
            
            if len(known_face_embeddings) > 0:
                for idx, known_emb in enumerate(known_face_embeddings):
                    score = recognizer.match(known_emb, curr_emb, cv2.FaceRecognizerSF_FR_COSINE)
                    if score > max_score:
                        max_score = score
                        if score > COSINE_THRESHOLD:
                            name = known_face_names[idx]
            
            if name == "Unknown":
                short_id = str(uuid.uuid4())[:8]
                new_name = f"Visitor_{short_id}"
                
                database.add_employee(new_name, curr_emb)
                
                try:
                    filename = f"{new_name}.jpg"
                    filepath = os.path.join(VISITORS_DIR, filename)
                    x, y, w_box, h_box = coords
                    x = max(0, x); y = max(0, y)
                    w_box = min(w_box, w - x); h_box = min(h_box, h - y)
                    if w_box > 0 and h_box > 0:
                        face_crop = frame[y:y+h_box, x:x+w_box]
                        cv2.imwrite(filepath, face_crop)
                except Exception:
                    pass
                
                known_face_names.append(new_name)
                known_face_embeddings.append(curr_emb)
                name = new_name

            x, y, w_box, h_box = coords
            color = (0, 255, 255) if name.startswith("Visitor_") else (0, 255, 0)
            cv2.rectangle(frame, (x, y), (x + w_box, y + h_box), color, 2)
            label = f"{name}"
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_DUPLEX, 0.6, color, 1)

    # --- PPE Detection & Status Logic ---
    helmet_detected = False
    helmet_missing = False # Explicit 'no_helmet' class
    
    if ppe_model:
        # Class names: {0: 'glove', 1: 'goggles', 2: 'helmet', 3: 'mask', 4: 'no_glove', 5: 'no_goggles', 6: 'no_helmet', 7: 'no_mask', 8: 'no_shoes', 9: 'shoes'}
        results = ppe_model(frame, verbose=False, conf=0.3) 
        for r in results:
            boxes = r.boxes
            for box in boxes:
                b = box.xyxy[0].cpu().numpy().astype(int)
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                
                if cls < len(ppe_model.names):
                    label_name = ppe_model.names[cls]
                else:
                    label_name = str(cls)
                
                # Logic based on real classes
                n = label_name.lower()
                
                color = (0, 165, 255) # Default Orange
                
                if 'no_helmet' in n:
                    helmet_missing = True
                    color = (0, 0, 255) # Red for danger
                elif 'helmet' in n:
                    helmet_detected = True
                    color = (0, 255, 0) # Green for safe
                    
                cv2.rectangle(frame, (b[0], b[1]), (b[2], b[3]), color, 2)
                label = f"{label_name} {conf:.2f}"
                cv2.putText(frame, label, (b[0], b[3] + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

    # --- STATUS OVERLAY ---
    if faces_detected > 0:
        # Logic: If 'no_helmet' detected -> DANGER
        # If 'helmet' detected -> SAFE
        # If neither -> UNKNOWN (or WARNING)
        
        status = "Checking PPE..."
        status_color = (255, 255, 255) # White

        if helmet_missing:
            status = "DANGER: NO HELMET"
            status_color = (0, 0, 255) # Red
        elif helmet_detected:
            status = "SAFE: Helmet On"
            status_color = (0, 255, 0) # Green
        else:
            status = "WARNING: No Helmet Detected"
            status_color = (0, 255, 255) # Yellow
            
        # Draw Status Box in Top-Right
        (tw, th), _ = cv2.getTextSize(status, cv2.FONT_HERSHEY_DUPLEX, 0.8, 1)
        cv2.rectangle(frame, (w - tw - 20, 10), (w - 10, 10 + th + 20), (0, 0, 0), -1) 
        cv2.putText(frame, status, (w - tw - 15, 35), cv2.FONT_HERSHEY_DUPLEX, 0.8, status_color, 1)

    return frame
