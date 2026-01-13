import cv2
import numpy as np
import database
import os
import uuid
import time
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

# Performance metrics
latest_latency = 0.0
latest_accuracy = 0.0

# Optimization: Frame Skipping & Caching
frame_counter = 0
last_render_data = [] # List of dicts: {'type': 'rect'|'text'|'filled_rect', 'args': [...], 'kwargs': {...}}

def render_overlay(frame, render_data):
    """Draws cached overlays on the frame."""
    for item in render_data:
        if item['type'] == 'rect':
            cv2.rectangle(frame, *item['args'], **item['kwargs'])
        elif item['type'] == 'text':
            cv2.putText(frame, *item['args'], **item['kwargs'])
        elif item['type'] == 'filled_rect':
            cv2.rectangle(frame, item['args'][0], item['args'][1], item['args'][2], -1) 


def load_models():
    global detector, recognizer, ppe_model, hand_model
    if not os.path.exists(face_c_path) or not os.path.exists(face_r_path):
        print("Face models not found! Run download_weights.py")
        return

    # Face Models
    # Score Threshold lowered to 0.6 (from 0.9) to accept more varied photos
    detector = cv2.FaceDetectorYN.create(face_c_path, "", (320, 320), 0.6, 0.3, 5000)
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
    load_visitors() 

def load_known_faces():
    global known_face_embeddings, known_face_names
    employees = database.get_all_employees()
    known_face_names = [e[0] for e in employees]
    known_face_embeddings = [e[1] for e in employees] 
    print(f"Loaded {len(known_face_names)} faces from database.")

def load_visitors():
    global visitor_embeddings, visitor_ids
    visitors = database.get_all_visitors()
    visitor_ids = [v['tracking_id'] for v in visitors]
    visitor_embeddings = [v['embedding'] for v in visitors]
    print(f"Loaded {len(visitor_ids)} visitors.")

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

import threading

# Global inference lock to prevent model concurrency issues
inference_lock = threading.Lock()

def process_frame(frame, modules=None):
    global latest_latency, latest_accuracy
    global frame_counter, last_render_data
    
    with inference_lock: # Serialize access to models
        start_time = time.time()
        frame_counter += 1
        
        # DEBUG
        print(f"FRAME {frame_counter}: mod={modules} skip={last_render_data is not None}", flush=True)
    
    # 1. SKIP LOGIC
    # DISABLE SKIP temporarily to fix module cross-talk
    SKIP_FRAMES = 1 
    should_process = True #(frame_counter % SKIP_FRAMES == 0) or (not last_render_data)
    
    # if not should_process and last_render_data:
    #     render_overlay(frame, last_render_data)
    #     return frame

    if detector is None:
        load_models()
        
    h, w, _ = frame.shape
    detector.setInputSize((w, h))

    # Default to all if not specified
    if modules is None or len(modules) == 0:
        run_face = True
        run_ppe = True
    else:
        # User Logic: 
        # 1. Face Module: ONLY Face (run_ppe = False)
        # 2. PPE Module: PPE + Face (run_ppe = True, run_face = True)
        
        if "ppe" in modules:
            run_ppe = True
            run_face = True # Force Face for PPE module
        elif "face" in modules:
            run_face = True
            run_ppe = False
        else:
             run_face = "face" in modules
             run_ppe = "ppe" in modules
    
    current_render_data = []
    total_confidence = 0.0
    detection_count = 0

    # ... (Face Logic is fine) ...

    # --- STATUS OVERLAY (Gated by run_ppe) ---
    if run_ppe and faces_detected > 0:
        missing = []
        if not helmet_detected: missing.append("HELMET")
        if not vest_detected: missing.append("VEST")
        
        # Gloves Logic
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
        
        status_lines = []
        overall_color = (0, 255, 0) # Safe by default
        
        if len(missing) == 0:
            status_lines.append("SAFE: Full PPE Detected")
        else:
            overall_color = (0, 0, 255) # Danger
            status_lines.append("DANGER: MISSING PPE")
            status_lines.append(", ".join(missing))
            
            # Log violation
            import random
            if random.random() < 0.05:
                try:
                    database.log_violation("PPE_MISSING", f"Missing: {', '.join(missing)}")
                except:
                    pass

        # Draw Status Box
        y_offset = 10
        for line in status_lines:
            (tw, th), _ = cv2.getTextSize(line, cv2.FONT_HERSHEY_DUPLEX, 0.8, 1)
            # Filled rect for background
            current_render_data.append({
                'type': 'filled_rect', 'args': [(w - tw - 20, y_offset), (w - 10, y_offset + th + 20), (0, 0, 0)], 'kwargs': {}
            })
            current_render_data.append({
                'type': 'text', 'args': [line, (w - tw - 15, y_offset + 25), cv2.FONT_HERSHEY_DUPLEX, 0.8, overall_color, 1], 'kwargs': {}
            })
            y_offset += 50
    
    # Update Performance Metrics
    elapsed = (time.time() - start_time) * 1000 # ms
    latest_latency = elapsed
    
    # ACCURACY FIX: Metric Stabilization
    # Only update accuracy if we actually detected objects. 
    # This prevents the metric from dropping to 0% just because the frame was empty.
    if detection_count > 0:
        latest_accuracy = (total_confidence / detection_count) * 100 
    
    # Save cache
    last_render_data = current_render_data
    
    # Render final
    render_overlay(frame, current_render_data)

    return frame
