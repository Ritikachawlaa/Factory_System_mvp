from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import cv2
import numpy as np
import database
import recognition
import io
import os

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

# Mount Visitors directory
VISITORS_DIR = os.path.join(os.path.dirname(__file__), "visitors")
if not os.path.exists(VISITORS_DIR):
    os.makedirs(VISITORS_DIR)
app.mount("/visitors", StaticFiles(directory=VISITORS_DIR), name="visitors")

# --- Models ---
class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CameraCreate(BaseModel):
    name: str
    source: str

class EmployeeUpdate(BaseModel):
    name: str

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
    if database.create_user("admin", get_password_hash("admin123")):
        print("Created default admin user (admin/admin123)")

# --- Auth Endpoints ---
@app.post("/signup")
async def signup(user: UserCreate):
    password_hash = get_password_hash(user.password)
    if database.create_user(user.username, password_hash):
        return {"message": "User created successfully"}
    else:
        raise HTTPException(status_code=400, detail="Username already exists")

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = database.get_user(form_data.username)
    if not user or not verify_password(form_data.password, user[1]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user[0]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

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

# --- Camera Endpoints ---
@app.post("/cameras")
def add_camera(camera: CameraCreate):
    database.add_camera(camera.name, camera.source)
    return {"message": "Camera added"}

@app.get("/cameras")
def get_cameras():
    return database.get_cameras()

@app.delete("/cameras/{cam_id}")
def delete_camera(cam_id: int):
    database.delete_camera(cam_id)
    return {"message": "Camera deleted"}

# --- User Management Endpoints ---
@app.get("/users")
def get_users():
    return database.get_all_users()

# --- Video Feed ---
def generate_frames(camera_source=0):
    # Try to parse as int (webcam index) or keep as string (URL)
    try:
        src = int(camera_source)
    except ValueError:
        src = camera_source
        
    camera = cv2.VideoCapture(src)
    if not camera.isOpened():
        print(f"Error: Could not open camera source {src}.")
        # Return a black frame with error text
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(img, "Camera Connection Failed", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        ret, buffer = cv2.imencode('.jpg', img)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        return

    while True:
        success, frame = camera.read()
        if not success:
            break
        
        frame = recognition.process_frame(frame)
        
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    camera.release()

@app.get("/video_feed")
def video_feed(source: str = "0"):
    return StreamingResponse(generate_frames(source), media_type="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
