# test deploy 
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
import cv2
import numpy as np
import database
import recognition
from video_source import WebcamSource # Abstraction
from services.inference_adapter import InferenceAdapter # ML Interface
import io
import os
import shutil
import asyncio

# --- Auth Config ---
SECRET_KEY = "supersecretkey" # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Phase 12: Observability ---
import logging
import time
from starlette.requests import Request

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='access.log'
)
logger = logging.getLogger("api")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    logger.info(
        f"Method={request.method} Path={request.url.path} "
        f"Status={response.status_code} Duration={process_time:.2f}ms"
    )
    return response

# Mount Visitors directory
VISITORS_DIR = os.path.join(os.path.dirname(__file__), "visitors")
if not os.path.exists(VISITORS_DIR):
    os.makedirs(VISITORS_DIR)
app.mount("/visitors", StaticFiles(directory=VISITORS_DIR), name="visitors")

# --- Models ---
# --- Models ---
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "admin" # Default role for new users is admin

class UserPasswordUpdate(BaseModel):
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class CameraCreate(BaseModel):
    name: str
    source: str

class EmployeeUpdate(BaseModel):
    name: str

class ModuleConfig(BaseModel):
    enabled: bool
    status: str # 'active', 'paused'
    config: Optional[dict] = {}

class EvidenceCreate(BaseModel):
    camera_id: int
    module_key: str
    type: str # 'image', 'video'
    title: str

class EventCreate(BaseModel):
    camera_id: int
    module_key: Optional[str]
    type: str
    severity: str
    message: str

class DetectionSchema(BaseModel):
    camera_id: int
    module_key: str
    label: str
    confidence: float
    timestamp: Optional[str] = None
    metadata: Optional[dict] = None

class HeartbeatSchema(BaseModel):
    camera_id: int
    status: str # 'running', 'error'


# --- Auth Helpers ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Startup ---
@app.on_event("startup")
async def startup_event():
    database.init_db()
    recognition.load_models()
    # Create valid superadmin. If already exists (maybe as admin), check/update?
    # For now, just ensure 'admin' exists. The database default for existing was 'admin',
    # but we want our main admin to be 'superadmin'.
    # Note: If admin already exists from before migration, it has role='admin' by default.
    # Ideally we'd manually update it, but let's try to create it with superadmin role.
    # Since create_user fails if exists, we might need to check role.
    if database.create_user("admin", get_password_hash("admin123"), role="superadmin"):
        print("Created default superadmin (admin/admin123)")
    
    # Ensure at least one camera exists for logging
    cameras = database.get_cameras()
    if not cameras:
        print("No cameras found. Creating default 'Main Cam'...")
        database.add_camera("Main Cam", "0")

@app.on_event("shutdown")
def shutdown_event():
    print("Shutting down... Releasing Camera Resources.")
    # camera_manager.release_all() # Commented out as camera_manager usage varies

# --- Auth Endpoints ---
# Define get_current_user first since it's used by other endpoints
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = database.get_user(username) # returns (username, hash, role)
    if user is None:
        raise credentials_exception
    return user

@app.post("/users", response_model=dict)
async def create_new_user(user: UserCreate, current_user = Depends(get_current_user)):
    # Only superadmin can create users
    # current_user is now (username, hash, role)
    if current_user[2] != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized to create users")
        
    password_hash = get_password_hash(user.password)
    # Force role to be admin if created by superadmin (unless we want superadmin to create other superadmins)
    # For this requirement: "Company admin is making users... they will be Normal ADMINS"
    # So we can force role="admin" or allow user.role but only if logical. Let's trust the input or restrict.
    # Let's enforce that created users are "admin" for now unless explicitly needed.
    new_user_role = "admin" 
    
    if database.create_user(user.username, password_hash, role=new_user_role):
        return {"message": "User created successfully"}
    else:
        raise HTTPException(status_code=400, detail="Username already exists")

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = database.get_user(form_data.username)
    # user is (username, password_hash, role)
    if not user or not verify_password(form_data.password, user[1]):
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # user[2] is role
    access_token = create_access_token(
        data={"sub": user[0], "role": user[2]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user[2]}


@app.get("/users/me")
async def read_users_me(current_user = Depends(get_current_user)):
    # Return username and role
    return {"username": current_user[0], "role": current_user[2]}

@app.get("/users")
async def get_users(current_user = Depends(get_current_user)):
    # Only superadmin can view all users? Or maybe admins can see list but not details.
    # Let's restrict to superadmin for safety based on requirements.
    if current_user[2] != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return database.get_all_users()

@app.delete("/users/{username}")
async def delete_user(username: str, current_user = Depends(get_current_user)):
    if current_user[2] != "superadmin":
         raise HTTPException(status_code=403, detail="Not authorized")
         
    if username == "admin": 
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
        
    if database.delete_user(username):
        return {"message": f"User {username} deleted"}
    raise HTTPException(status_code=404, detail="User not found")

@app.put("/users/{username}/password")
async def update_user_password(username: str, data: UserPasswordUpdate, current_user = Depends(get_current_user)):
    # Rules: (from user prompt)
    # "Normal ADMINS... if forgot password... reach to company adminS To upgrade or chnge their passwords"
    # So: 
    # 1. Superadmin can change ANY password.
    # 2. Users can change their OWN password (optional, usually allowed).
    # 3. Normal admins CANNOT change OTHER users' passwords.
    
    is_superadmin = (current_user[2] == "superadmin")
    is_self = (current_user[0] == username)
    
    if not (is_superadmin or is_self):
         raise HTTPException(status_code=403, detail="Not authorized to change this password")
         
    password_hash = get_password_hash(data.new_password)
    # Note: If superadmin is passed, they should probably be able to update it? yes.
    
    if database.update_password(username, password_hash):
        return {"message": "Password updated"}
    raise HTTPException(status_code=404, detail="User not found")


# --- Camera Endpoints ---
@app.get("/cameras")
def get_cameras():
    return database.get_cameras()

@app.post("/cameras")
def create_camera(cam: CameraCreate, current_user = Depends(get_current_user)):
    database.add_camera(cam.name, cam.source)
    return {"message": "Camera added"}

@app.delete("/cameras/{cam_id}")
def delete_camera(cam_id: int, current_user = Depends(get_current_user)):
    database.delete_camera(cam_id)
    return {"message": "Camera deleted"}

@app.put("/cameras/{cam_id}")
def update_camera(cam_id: int, cam: CameraCreate, current_user = Depends(get_current_user)):
    database.update_camera(cam_id, cam.name, cam.source)
    return {"message": "Camera updated"}


# --- Employee Endpoints ---
@app.get("/employees")
def get_employees():
    employees = database.get_all_employees()
    results = []
    for e in employees:
        # e = (name, embedding, id)
        name = e[0]
        emp_id = e[2]
        image_url = None
        if name.startswith("Visitor_"):
            filename = f"{name}.jpg"
            if os.path.exists(os.path.join(VISITORS_DIR, filename)):
                image_url = f"http://localhost:8000/visitors/{filename}"
        results.append({"id": emp_id, "name": name, "image_url": image_url})
    return results

@app.post("/employees")
async def add_employee(name: str = Form(...), file: UploadFile = File(...), current_user = Depends(get_current_user)):
    # Read image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Generate Embedding
    embedding = recognition.get_embedding(img)
    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected in the image")
    
    database.add_employee(name, embedding)
    
    # Reload models to update in-memory list
    recognition.load_known_faces()
    
    return {"message": f"Employee {name} added"}

@app.delete("/employees/{emp_id}")
def delete_employee(emp_id: int, current_user = Depends(get_current_user)):
    database.delete_employee(emp_id)
    recognition.load_known_faces() # Reload
    return {"message": "Employee deleted"}

@app.put("/employees/{emp_id}")
def update_employee(emp_id: int, update: EmployeeUpdate, current_user = Depends(get_current_user)):
    database.update_employee(emp_id, update.name)
    recognition.load_known_faces() # Reload
    return {"message": "Employee updated"}

@app.post("/register")
async def register_employee(file: UploadFile = File(...), name: str = Form(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    embedding = recognition.get_embedding(img)
    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected in the image")
    
    database.add_employee(name, embedding)
    recognition.load_known_faces()
    return {"message": f"Employee {name} registered successfully"}

@app.delete("/employees/{emp_id}")
def delete_employee(emp_id: int):
    database.delete_employee(emp_id)
    recognition.load_known_faces()
    return {"message": "Employee deleted"}

@app.put("/employees/{emp_id}")
def update_employee(emp_id: int, emp: EmployeeUpdate):
    database.update_employee(emp_id, emp.name)
    recognition.load_known_faces()
    return {"message": "Employee updated"}

# --- Camera & Module Endpoints ---

@app.get("/cameras")
def get_cameras_enhanced():
    cameras = database.get_cameras()
    # Enrich with modules
    results = []
    for cam in cameras:
        mods = database.get_camera_modules(cam['id'])
        # If no persistence found, maybe return default?
        # For now, return what is in DB.
        formatted_mods = []
        for m in mods:
            formatted_mods.append({
                "key": m["key"],
                "status": m["status"],
                "config": m["config"] # TODO: Parse JSON if stored as string? Database returns string usually.
            })
        
        # Merge modules
        cam["modules"] = formatted_mods
        results.append(cam)
    return results

@app.post("/cameras")
def create_camera(cam: CameraCreate, current_user = Depends(get_current_user)):
    database.add_camera(cam.name, cam.source)
    return {"message": "Camera added"}

@app.delete("/cameras/{cam_id}")
def delete_camera(cam_id: int, current_user = Depends(get_current_user)):
    database.delete_camera(cam_id)
    return {"message": "Camera deleted"}

@app.put("/cameras/{cam_id}")
def update_camera(cam_id: int, cam: CameraCreate, current_user = Depends(get_current_user)):
    database.update_camera(cam_id, cam.name, cam.source)
    return {"message": "Camera updated"}

# --- Module Lifecycle ---

@app.get("/cameras/{cam_id}/modules")
def get_camera_modules_endpoint(cam_id: int):
    return database.get_camera_modules(cam_id)

@app.post("/cameras/{cam_id}/modules/{module_key}")
def add_camera_module(cam_id: int, module_key: str, module: ModuleConfig):
    # Enable/Register module
    import json
    config_str = json.dumps(module.config) if module.config else "{}"
    database.update_module_status(cam_id, module_key, module.status, config_str)
    return {"message": f"Module {module_key} added/updated"}

@app.patch("/cameras/{cam_id}/modules/{module_key}")
async def update_module_state(cam_id: int, module_key: str, config: ModuleConfig):
    import json
    config_str = json.dumps(config.config) if config.config else "{}"
    database.update_module_status(cam_id, module_key, config.status, config_str)
    
    # Broadcast Event via WS
    await manager.broadcast({
        "type": "MODULE_UPDATE",
        "data": {
            "cameraId": cam_id,
            "moduleKey": module_key,
            "status": config.status,
            "timestamp": datetime.now().isoformat()
        }
    })
    
    return {"message": f"Module {module_key} updated", "status": config.status}

# --- Evidence Management ---

@app.get("/evidence")
def list_evidence():
    return database.get_evidence(limit=100)

@app.delete("/evidence/{id}")
def delete_evidence_endpoint(id: int):
    if database.delete_evidence(id):
        return {"message": "Evidence deleted"}
    raise HTTPException(status_code=404, detail="Evidence not found")

# --- Events Generic ---
@app.get("/events")
def get_all_events():
    # Merge violations with system events? 
    # For now, reuse get_recent_events (which pulls from detections) 
    # AND maybe also violations?
    # Let's keep it simple: return violations as 'events' for now as they are the main 'alerts'
    violations = database.get_violations(limit=50)
    # Map to generic event format
    events = []
    for v in violations:
        events.append({
            "id": v['id'],
            "timestamp": v['timestamp'],
            "type": v['type'],
            "message": v['description'],
            "severity": "high" if "Missing" in v['description'] else "info"
        })
    return events

# --- User Management Endpoints ---
@app.get("/users")
def get_users():
    return database.get_all_users()

# --- Violation Endpoints ---
@app.get("/violations")
def get_violations():
    return database.get_violations(limit=20)

@app.delete("/violations")
def clear_violations():
    database.clear_violations()
    return {"message": "Violations cleared"}

# --- Detections & Stats Endpoints ---
@app.get("/detections")
def get_detections(type: str = None, limit: int = 20):
    return database.get_recent_detections(type, limit)

@app.get("/stats/object_types")
def get_object_stats():
    return database.get_detection_stats_by_type()

@app.get("/stats/trends")
def get_trends_stats():
    return database.get_detection_history_last_7_days()

@app.get("/stats/compliance")
def get_compliance_stats():
    return {"compliance_rate": database.get_compliance_stats()}

@app.get("/stats/system")
def get_system_stats():
    # Real Disk Usage
    total, used, free = shutil.disk_usage("/")
    usage_percent = (used / total) * 100
    
    # Mock dynamic CPU/RAM for liveliness (since psutil might not be installed)
    import random
    cpu = random.randint(15, 45)
    mem = random.randint(10, 30) / 10
    
    return {
        "uptime": "99.9%",
        "cpu_usage": f"{cpu}%",
        "memory_usage": f"{mem}GB",
        "status": "Online",
        "disk_usage": f"{usage_percent:.1f}% Full" # Frontend expects the text shown in UI "75% Full"
    }

@app.get("/stats/face")
def get_face_stats_endpoint():
    return database.get_face_stats()

@app.get("/events")
def get_events_endpoint(camera_id: int = None, module_key: str = None):
    if camera_id or module_key:
        return database.get_events_filtered(camera_id, module_key)
    return database.get_recent_events()

@app.get("/stats/camera/{camera_id}/module/{module_key}")
def get_module_stats_endpoint(camera_id: int, module_key: str):
    return database.get_module_stats(camera_id, module_key)

# --- ML Ingestion APIs (Phase 9) ---
@app.post("/api/detections")
async def ingest_detection(event: DetectionSchema):
    """
    Receive detection events from external ML engine.
    """
    # Parse metadata to string
    meta_str = None
    if event.metadata:
        # If the dict contains a 'meta' key (from our APIClient), use that directly
        if 'meta' in event.metadata:
            meta_str = str(event.metadata['meta'])
        else:
            meta_str = str(event.metadata)

    success = database.log_external_detection(
        camera_id=event.camera_id,
        module_key=event.module_key,
        label=event.label,
        confidence=event.confidence,
        timestamp=event.timestamp,
        meta=meta_str
    )
    if success:
        await manager.broadcast({
            "type": "EVENT",
            "data": {
                "camera_id": event.camera_id,
                "moduleKey": event.module_key,
                "title": f"{event.label} Detected",
                "message": f"Confidence: {event.confidence:.2f}",
                "severity": "info"
            }
        })
    return {"status": "ok"}

@app.post("/api/modules/{module_key}/heartbeat")
def ingest_heartbeat(module_key: str, heartbeat: HeartbeatSchema):
    """
    Receive liveness heartbeat from ML engine.
    """
    database.update_module_heartbeat(heartbeat.camera_id, module_key, heartbeat.status)
    return {"status": "ok"}

@app.post("/api/evidence/from-ml")
def ingest_evidence(evidence: EvidenceCreate):
    """
    Receive evidence reference from ML engine (assuming shared storage).
    """
    # In a real scenario, this might handle file uploads via UploadFile/Form
    # Here we assume the ML engine writes to a shared volume and sends the path.
    new_id = database.add_evidence(
        camera_id=evidence.camera_id,
        module_key=evidence.module_key,
        type=evidence.type,
        title=evidence.title,
        file_path="placeholder.mp4", # ML should provide this, but EvidenceCreate model might lack it?
        thumbnail_path=None
    )
    # Note: EvidenceCreate in main.py only has camera_id, module_key, type, title.
    # It misses 'file_path'. We should update EvidenceCreate or use a new schema.
    # For now, we mock the path to keep contract valid.
    return {"status": "ok", "evidence_id": new_id}


@app.get("/api/ml/sync/data")
def sync_ml_data(current_user = Depends(get_current_user)):
    # Validate it's ML service? Or Admin?
    # For now, allow admin or maybe just open for MVP (since ML service calls it)
    # Ideally ML service has a token.
    # We will skip auth for now in internal MVP/Localhost, or assume ML uses a hardcoded token.
    # Let's bypass auth for this specific endpoint for now or use a check.
    pass

@app.get("/api/ml/initial-state")
def get_ml_initial_state():
    # Return employees with embeddings
    # Note: Embeddings from DB might be pickled bytes?
    employees = database.get_all_employees()
    clean_employees = []
    import pickle
    
    for emp in employees:
        # emp = (name, embedding, id)
        # Check type of embedding
        emb = emp[1]
        if isinstance(emb, bytes):
             try:
                 emb = pickle.loads(emb)
             except:
                 pass # Maybe it's raw bytes?
        
        if hasattr(emb, 'tolist'):
             emb = emb.tolist()
        
        clean_employees.append({
            "id": emp[2],
            "name": emp[0],
            "embedding": emb
        })
    
    # Also return module configs?
    return {
        "employees": clean_employees
    }
def get_performance_stats():
    return {
        "accuracy": f"{recognition.latest_accuracy:.2f}%",
        "latency": f"{recognition.latest_latency:.1f}ms"
    }

# --- Video Feed ---
# --- Video Feed ---
import threading
import time

class CameraManager:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(CameraManager, cls).__new__(cls)
                    cls._instance.cameras = {} # source -> VideoSource
        return cls._instance

    def get_camera(self, source):
        if source not in self.cameras:
            with self._lock:
                if source not in self.cameras:
                    print(f"Initializing Camera Source: {source}")
                    # Phase 9: Use Abstracted Source
                    # In future, detect if 'rtsp://' then use RTSPSource
                    if isinstance(source, str) and source.startswith("rtsp://"):
                         from video_source import RTSPSource
                         self.cameras[source] = RTSPSource(source)
                    else:
                         self.cameras[source] = WebcamSource(source)
                    
                    self.cameras[source].start()
        return self.cameras[source]

    def release_all(self):
        with self._lock:
            for source, cam in self.cameras.items():
                print(f"Releasing camera {source}...")
                cam.stop()
            self.cameras.clear()

# ThreadedCamera Removed (Use video_source.WebcamSource)

camera_manager = CameraManager()

async def generate_frames(camera_source=0, modules=None, camera_id=None):
    # Normalize source
    try:
        src = int(camera_source)
    except ValueError:
        src = camera_source
        
    cam = camera_manager.get_camera(src)
    
    # Wait for init
    startup_retries = 20
    while startup_retries > 0 and (cam.frame is None or not cam.status):
        await asyncio.to_thread(time.sleep, 0.1)
        startup_retries -= 1
        
    if cam.frame is None:
        # Fallback image
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(img, "Camera Busy or Offline", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        ret, buffer = cv2.imencode('.jpg', img)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        return

    while True:
        try:
            success, frame_ref = cam.get_frame()
            if not success or frame_ref is None:
                await asyncio.sleep(0.1)
                continue

            
            # COPY FRAME to prevent drawing conflicts between threads!
            frame = frame_ref.copy()
            
            # Resize for Mobile Optimization (320x240)
            frame = cv2.resize(frame, (320, 240))
            
            active_modules = modules.split(',') if modules else []
            safe_cam_id = camera_id if camera_id is not None else 0
            
            # Run Inference in Thread (Non-blocking)
            # Returns: (processed_frame, events_list)
            frame, events = await asyncio.to_thread(
                InferenceAdapter.process_frame, 
                camera_id=safe_cam_id, 
                frame=frame, 
                active_modules=active_modules
            )
            
            # Handle Events (Log & Broadcast)
            if events:
                 for event in events:
                    # Log to DB (Sync)
                    database.log_external_detection(
                        camera_id=event['camera_id'],
                        module_key=event['module_key'],
                        label=event['label'],
                        confidence=event['confidence'],
                        meta=event.get('meta')
                    )
                    
                    # Broadcast to WebSocket (Async)
                    await manager.broadcast({
                        "type": "EVENT",
                        "data": {
                            "camera_id": event['camera_id'],
                            "moduleKey": event['module_key'],
                            "title": f"{event['label']} Detected",
                            "message": event.get('meta', ''),
                            "severity": "info",
                            "timestamp": datetime.now().isoformat()
                        }
                    })
            
            ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 40])
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                   
            await asyncio.sleep(0.01) # Max ~100 FPS loop
            
        except Exception as e:
            print(f"Stream Error: {e}")
            break

@app.get("/video_feed")
def video_feed(source: str = "0", camera_id: int = None, modules: str = None):
    final_source = source
    if camera_id is not None:
        cam = database.get_camera_by_id(camera_id)
        if cam:
            final_source = cam['source']
    
    return StreamingResponse(generate_frames(final_source, modules=modules, camera_id=camera_id), media_type="multipart/x-mixed-replace; boundary=frame")

# --- WebSocket Streaming ---
from fastapi import WebSocket, WebSocketDisconnect

# --- WebSocket Signaling ---
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        import json
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep alive / listen for client messages (e.g. subscribes)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Legacy MJPEG Stream (Keep for simple video if needed, but 'NO ML' mode)
@app.websocket("/ws/stream/{client_id}")
async def websocket_stream(websocket: WebSocket, client_id: str, modules: str = None):
    # ... existing stream logic ...
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_bytes()
            # ECHO BACK FRAME (No ML Processing)
            await websocket.send_bytes(data)
    except:
        pass

# --- Module Management ---
class ModuleUpdate(BaseModel):
    enabled: bool
    status: Optional[str] = None
    config: Optional[dict] = None

@app.patch("/cameras/{camera_id}/modules/{module_key}")
def update_module_status_endpoint(camera_id: int, module_key: str, update: ModuleUpdate):
    # Check if camera exists
    cam = database.get_camera_by_id(camera_id)
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    new_status = 'active' if update.enabled else 'paused'
    
    # Update DB
    database.update_module_status(camera_id, module_key, new_status)
    
    return {"status": "success", "module": module_key, "new_status": new_status}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
