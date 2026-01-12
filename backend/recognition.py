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
ppe_path = os.path.join(WEIGHTS_DIR, "best_ppe.pt")
hand_path = os.path.join(WEIGHTS_DIR, "hand_yolov8n.pt")

VISITORS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "visitors")
if not os.path.exists(VISITORS_DIR):
    os.makedirs(VISITORS_DIR)

# Initialize models
detector = None
recognizer = None
ppe_model = None
hand_model = None

def load_models():
    global detector, recognizer, ppe_model, hand_model
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
        
    # Hand Model (YOLOv8)
    if os.path.exists(hand_path):
        print(f"Loading Hand Model from {hand_path}...")
        hand_model = YOLO(hand_path)
    else:
        print("Hand Model weights not found, skipping Hand Detection.")

    print("All models loaded.")
    load_known_faces()

def load_known_faces():
    global known_face_embeddings, known_face_names
    employees = database.get_all_employees()
    # e is now (name, embedding, id)
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

def compute_iou(box1, box2):
    # box: [x1, y1, x2, y2]
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    
    inter_area = max(0, x2 - x1) * max(0, y2 - y1)
    
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
    
    union_area = box1_area + box2_area - inter_area
    if union_area == 0: return 0
    return inter_area / union_area

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
    # Classes: {0: 'Gloves', 1: 'Vest', 2: 'goggles', 3: 'helmet', 4: 'mask', 5: 'safety_shoe'}
    
    helmet_detected = False
    vest_detected = False
    
    # Store detected items for cross-referencing
    detected_gloves_boxes = []
    
    if ppe_model:
        results = ppe_model(frame, verbose=False, conf=0.4) 
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
                
                # Normalize label
                n = label_name.lower()
                
                color = (255, 165, 0) # Default Orange
                
                if 'helmet' in n:
                    helmet_detected = True
                    color = (0, 255, 0)
                elif 'vest' in n:
                    vest_detected = True
                    color = (0, 255, 0)
                elif 'gloves' in n:
                    detected_gloves_boxes.append(b)
                    color = (0, 255, 0)
                    
                cv2.rectangle(frame, (b[0], b[1]), (b[2], b[3]), color, 2)
                label = f"{label_name} {conf:.2f}"
                cv2.putText(frame, label, (b[0], b[3] + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

    # --- Hand Detection ---
    hands_detected = [] # List of [x1, y1, x2, y2]
    if hand_model:
         hand_results = hand_model(frame, verbose=False, conf=0.4)
         for r in hand_results:
             for box in r.boxes:
                 b = box.xyxy[0].cpu().numpy().astype(int)
                 hands_detected.append(b)
                 # Visualization for Hands (Optional, maybe Blue)
                 cv2.rectangle(frame, (b[0], b[1]), (b[2], b[3]), (255, 0, 0), 1)
                 cv2.putText(frame, "Hand", (b[0], b[1] - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 0, 0), 1)

    # --- STATUS OVERLAY ---
    if faces_detected > 0:
        # Check requirements
        missing = []
        if not helmet_detected: missing.append("HELMET")
        if not vest_detected: missing.append("VEST")
        
        # Gloves Logic:
        # If Hands Detected -> Check if each hand is Gloved.
        # If Hand detected AND No Glove overlap -> MISSING GLOVES.
        # If NO Hand detected -> Passed (Assume hidden/safe).
        
        if len(hands_detected) > 0:
            bare_hands = 0
            for h_box in hands_detected:
                is_gloved = False
                for g_box in detected_gloves_boxes:
                    iou = compute_iou(h_box, g_box)
                    if iou > 0.1: # Threshold for overlap
                        is_gloved = True
                        break
                if not is_gloved:
                    bare_hands += 1
            
            if bare_hands > 0:
                missing.append("GLOVES")
        # else: No hands visible -> No violation for gloves.

        
        status_lines = []
        overall_color = (0, 255, 0) # Safe by default
        
        if len(missing) == 0:
            status_lines.append("SAFE: Full PPE Detected")
        else:
            overall_color = (0, 0, 255) # Danger
            status_lines.append("DANGER: MISSING PPE")
            status_lines.append(", ".join(missing))
            
            # Log violation (simple rate limiting could be added here if needed, but for now we rely on DB inserts)
            # To prevent spam, we could check a global timestamp or just let it flow (might be heavy on DB)
            # For this simplified version, let's log with a random chance or skip to avoid massive DB growth in 1 sec
            import random
            if random.random() < 0.05: # Log ~5% of frames to avoid DB lock/spam
                try:
                    database.log_violation("PPE_MISSING", f"Missing: {', '.join(missing)}")
                except:
                    pass

        # Draw Status Box
        y_offset = 10
        for line in status_lines:
            (tw, th), _ = cv2.getTextSize(line, cv2.FONT_HERSHEY_DUPLEX, 0.8, 1)
            cv2.rectangle(frame, (w - tw - 20, y_offset), (w - 10, y_offset + th + 20), (0, 0, 0), -1) 
            cv2.putText(frame, line, (w - tw - 15, y_offset + 25), cv2.FONT_HERSHEY_DUPLEX, 0.8, overall_color, 1)
            y_offset += 50

    return frame
