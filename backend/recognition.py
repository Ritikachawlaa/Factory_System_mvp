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
    faces = detector.detect(frame)
    if faces[1] is not None:
        COSINE_THRESHOLD = 0.363 
        
        for face in faces[1]:
            coords = face[:4].astype(int)
            aligned_face = recognizer.alignCrop(frame, face)
            feature = recognizer.feature(aligned_face)
            curr_emb = feature[0]
            
            name = "Unknown"
            max_score = 0.0
            
            # 1. Compare against known faces
            if len(known_face_embeddings) > 0:
                for idx, known_emb in enumerate(known_face_embeddings):
                    score = recognizer.match(known_emb, curr_emb, cv2.FaceRecognizerSF_FR_COSINE)
                    if score > max_score:
                        max_score = score
                        if score > COSINE_THRESHOLD:
                            name = known_face_names[idx]
            
            # 2. Auto-Register Unknowns
            if name == "Unknown":
                short_id = str(uuid.uuid4())[:8]
                new_name = f"Visitor_{short_id}"
                
                # Add to DB
                database.add_employee(new_name, curr_emb)
                
                # Save Snapshot
                try:
                    filename = f"{new_name}.jpg"
                    filepath = os.path.join(VISITORS_DIR, filename)
                    # Save the aligned face or crop from original? 
                    # Aligned is better for recognition, but Crop is better for human viewing.
                    # Let's save the Crop.
                    x, y, w_box, h_box = coords
                    # Ensure within bounds
                    x = max(0, x); y = max(0, y)
                    w_box = min(w_box, w - x); h_box = min(h_box, h - y)
                    if w_box > 0 and h_box > 0:
                        face_crop = frame[y:y+h_box, x:x+w_box]
                        cv2.imwrite(filepath, face_crop)
                        print(f"Saved snapshot to {filepath}")
                except Exception as e:
                    print(f"Failed to save snapshot: {e}")
                
                # Add to memory
                known_face_names.append(new_name)
                known_face_embeddings.append(curr_emb)
                
                name = new_name
                print(f"Auto-registered: {new_name}")

            # Draw box
            x, y, w_box, h_box = coords
            
            if name.startswith("Visitor_"):
                color = (0, 255, 255) # Yellow
            else:
                color = (0, 255, 0) # Green

            cv2.rectangle(frame, (x, y), (x + w_box, y + h_box), color, 2)
            label = f"{name}"
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_DUPLEX, 0.6, color, 1)

    # --- PPE Detection ---
    if ppe_model:
        results = ppe_model(frame, verbose=False, conf=0.4) 
        for r in results:
            boxes = r.boxes
            for box in boxes:
                b = box.xyxy[0].cpu().numpy().astype(int)
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                
                # Check bounds
                if cls < len(ppe_model.names):
                    label_name = ppe_model.names[cls]
                else:
                    label_name = str(cls)
                
                color = (0, 165, 255) # Orange
                cv2.rectangle(frame, (b[0], b[1]), (b[2], b[3]), color, 2)
                label = f"{label_name} {conf:.2f}"
                cv2.putText(frame, label, (b[0], b[3] + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

    return frame
