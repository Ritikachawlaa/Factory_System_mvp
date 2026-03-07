import cv2
import numpy as np
import os
import logging
import requests
from deepface import DeepFace

logger = logging.getLogger("recognition")

# ── Global employee name cache ──────────────────────────────────────────
# Loaded from the backend; maps employee-id → name
_employee_cache = {}        # {int(id): str(name)}
_cache_loaded = False

from config import BACKEND_API_URL, MODEL_NAME

BACKEND_URL = BACKEND_API_URL
MIN_FACE_W = int(os.getenv("MIN_FACE_WIDTH", "70"))
MIN_FACE_H = int(os.getenv("MIN_FACE_HEIGHT", "70"))
AWS_MATCH_THRESHOLD = int(os.getenv("AWS_REKOGNITION_MATCH_THRESHOLD", "80"))


# ── Helpers ─────────────────────────────────────────────────────────────

def _extract_face_crop(frame, region, pad_ratio=0.30):
    """Crop face with padding to improve Rekognition matching robustness."""
    h, w = frame.shape[:2]
    x = int(region["x"])
    y = int(region["y"])
    bw = int(region["w"])
    bh = int(region["h"])

    pad_w = int(bw * pad_ratio)
    pad_h = int(bh * pad_ratio)

    x1 = max(0, x - pad_w)
    y1 = max(0, y - pad_h)
    x2 = min(w, x + bw + pad_w)
    y2 = min(h, y + bh + pad_h)

    if x2 <= x1 or y2 <= y1:
        return None
    crop = frame[y1:y2, x1:x2]
    return crop if crop.size > 0 else None


def _refresh_employee_cache():
    """Pull employee list from the backend so we can map IDs → names."""
    global _employee_cache, _cache_loaded
    try:
        resp = requests.get(f"{BACKEND_URL}/employees", timeout=5)
        resp.raise_for_status()
        employees = resp.json()
        _employee_cache = {int(e["id"]): e["name"] for e in employees}
        _cache_loaded = True
        logger.info(f"Employee cache refreshed: {len(_employee_cache)} employees")
    except Exception as e:
        logger.warning(f"Failed to refresh employee cache: {e}")


def _employee_name(emp_id: int) -> str:
    """Return the employee name for a given ID, refreshing cache if needed."""
    global _cache_loaded
    if not _cache_loaded:
        _refresh_employee_cache()
    name = _employee_cache.get(emp_id)
    if name is None:
        # Cache miss – try a single refresh
        _refresh_employee_cache()
        name = _employee_cache.get(emp_id)
    return name or f"Employee #{emp_id}"


# ── Model loading ──────────────────────────────────────────────────────

def load_models():
    """Pre-warm the DeepFace detector model so the first frame isn't slow."""
    logger.info("Pre-loading DeepFace model …")
    try:
        dummy = np.zeros((160, 160, 3), dtype=np.uint8)
        DeepFace.represent(dummy, model_name=MODEL_NAME, enforce_detection=False)
        logger.info("DeepFace model loaded.")
        _refresh_employee_cache()
    except Exception as e:
        logger.error(f"Model load failed: {e}")


def load_known_faces():
    """Refresh the employee cache (called after employee add/delete)."""
    _refresh_employee_cache()


def load_know_faces_safe():
    try:
        load_known_faces()
    except Exception as e:
        logger.warning(f"load_know_faces_safe: {e}")


# ── Core: AWS Rekognition generic flow ─────────────────────────────────

def identify_faces(frame, is_crop=False):
    """
    Generic AWS Rekognition flow:
      1. Detect faces locally (DeepFace) to get bounding boxes.
      2. For each detected face, crop it and send to AWS Rekognition
         search_faces_by_image to recognise the person.
      3. Return list of (name, emp_id, score, (x, y, w, h)).
    """
    detections = []

    logger.info(f"identify_faces called. Frame shape: {frame.shape}, is_crop: {is_crop}")

    # ── Step 1: Local face DETECTION ───────────────────────────────────
    results = None
    try:
        # Optimization: Use a single, fast backend. OpenCV is fastest on CPU.
        # Fallback to mediapipe if available, then retinaface only as last resort.
        primary_backend = 'opencv' 
        
        results = DeepFace.represent(
            img_path=frame,
            model_name=MODEL_NAME,
            enforce_detection=False,
            detector_backend=primary_backend,
            align=True
        )
        
        # If OpenCV fails to find anything but it's a large frame, try one robust but slow backend
        if (not results or len(results) == 0) and not is_crop:
             results = DeepFace.represent(
                img_path=frame,
                model_name=MODEL_NAME,
                enforce_detection=False,
                detector_backend='mediapipe', 
                align=True
            )
    except Exception as e:
        logger.error(f"Face detection error: {e}")

    if not results:
        return []

    # ── Step 2 & 3: For each face, crop → AWS Rekognition ─────────────
    from utils.aws_face_service import aws_face_service

    for res in results:
        region = res["facial_area"]

        # Skip phantom detections
        total_area = frame.shape[0] * frame.shape[1]
        if not is_crop and (region['w'] * region['h']) > (total_area * 0.95):
            logger.debug("Skipping oversized detection (whole-frame ghost)")
            continue
        if int(region['w']) < MIN_FACE_W or int(region['h']) < MIN_FACE_H:
            logger.debug(f"Skipping tiny face: {region['w']}x{region['h']}")
            continue

        name = "Unknown"
        emp_id = None
        best_score = 0.0

        # Crop face and encode as JPEG for AWS
        face_crop = _extract_face_crop(frame, region, pad_ratio=0.30)
        if face_crop is not None and face_crop.size > 0:
            try:
                ok, buf = cv2.imencode(".jpg", face_crop, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
                if ok:
                    aws_match = aws_face_service.search_face(
                        buf.tobytes(),
                        threshold=AWS_MATCH_THRESHOLD
                    )
                    if aws_match:
                        matched_emp_id = int(aws_match['external_id'])
                        matched_name = _employee_name(matched_emp_id)
                        name = matched_name
                        emp_id = matched_emp_id
                        best_score = float(aws_match['confidence'])
                        logger.info(f"AWS Match: {name} (ID: {emp_id}, score: {best_score:.2f})")
            except Exception as e:
                logger.warning(f"AWS search error: {e}")

        if name == "Unknown":
            logger.debug(f"No AWS match for face at ({region['x']}, {region['y']})")

        x = int(region['x'])
        y = int(region['y'])
        w = int(region['w'])
        h = int(region['h'])

        detections.append((name, emp_id, best_score, (x, y, w, h)))

    return detections


def recognize_faces(frame):
    """Draw recognition results onto the frame (utility / legacy)."""
    for name, emp_id, score, (x, y, w, h) in identify_faces(frame):
        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
        label = f"{name} (ID: {emp_id})" if emp_id else name
        cv2.putText(frame, f"{label} ({score:.2f})", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    return frame


def process_frame(frame, modules=None):
    if modules is None:
        modules = []
    if any('face' in m.lower() for m in modules):
        return recognize_faces(frame)
    return frame
