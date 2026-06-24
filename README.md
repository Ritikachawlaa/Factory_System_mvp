# 🎥 Cam_AI - Enterprise Factory Safety Detection System

> **AI-Powered Real-Time Video Analysis for Factory Safety & Compliance**

A production-grade factory safety monitoring system leveraging computer vision and deep learning to provide real-time detection, analytics, and comprehensive threat management.

---

## 📋 Quick Overview

**Cam_AI** is an enterprise surveillance platform with:
- ✅ **14+ AI Detection Modules** - PPE compliance, intrusion, fire, loitering, motion tracking, crowd density
- ✅ **Real-Time Processing** - Multi-camera concurrent analysis with <500ms latency
- ✅ **Web Dashboard** - Modern React UI with live streaming and analytics
- ✅ **Enterprise Security** - JWT authentication, RBAC, audit logging, AWS integration
- ✅ **Scalable Architecture** - Microservices design for horizontal scaling

---

## 🏗️ System Architecture Overview

### **Three-Tier Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                                  │
│                                                                               │
│         ┌──────────────────────────────────────────────────────────┐        │
│         │         React Dashboard + Web UI (Vite)                  │        │
│         │                                                           │        │
│         │  ├─ Live Video Feeds        ├─ Real-time Alerts        │        │
│         │  ├─ Camera Management       ├─ Analytics & Reports     │        │
│         │  ├─ Event Timeline          └─ Settings & Config       │        │
│         └──────────────────────────────────────────────────────────┘        │
└────────────────────────────┬─────────────────────────────────────────────────┘
                             │ HTTPS/WebSocket
                             │
┌────────────────────────────┴─────────────────────────────────────────────────┐
│                          APPLICATION LAYER                                    │
│                                                                               │
│  ┌──────────────────────────────┐      ┌──────────────────────────────┐     │
│  │   FastAPI Backend Service    │      │   ML Engine (Flask)          │     │
│  │   (Python + Async)           │◄────►│   (YOLOv8 + DeepFace)       │     │
│  │                              │      │                              │     │
│  │ ├─ Authentication (JWT)      │      │ ├─ Frame Inference           │     │
│  │ ├─ API Endpoints             │      │ ├─ 14 Detection Modules     │     │
│  │ ├─ WebSocket Streaming       │      │ ├─ Face Recognition         │     │
│  │ ├─ Event Management          │      │ ├─ Object Tracking          │     │
│  │ └─ Database Operations       │      │ └─ Real-time Bbox Output   │     │
│  └──────────────────────────────┘      └──────────────────────────────┘     │
│                                                                               │
└────────────────────────────┬─────────────────────────────────────────────────┘
                             │ SQL / REST
                             │
┌────────────────────────────┴─────────────────────────────────────────────────┐
│                          DATA LAYER                                           │
│                                                                               │
│  ┌──────────────────────┐    ┌──────────────────────┐    ┌─────────────┐   │
│  │  PostgreSQL / SQLite │    │  Face Gallery        │    │  AWS Cloud  │   │
│  │                      │    │  (Embeddings)        │    │  Services   │   │
│  │ ├─ Users             │    │                      │    │             │   │
│  │ ├─ Cameras           │    │ ├─ Employee Faces   │    │ ├─ Rekogn.  │   │
│  │ ├─ Events            │    │ ├─ Unknown Faces    │    │ ├─ S3       │   │
│  │ ├─ Detections        │    │ └─ Face Metadata    │    │ └─ CloudWatch
│  │ ├─ Audit Logs        │    │                      │    │             │   │
│  │ └─ System Config     │    └──────────────────────┘    └─────────────┘   │
│  └──────────────────────┘                                                    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Data Processing Pipeline

```
STAGE 1: VIDEO INGESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Camera (RTSP/USB/IP)  →  MediaMTX Stream Server  →  SafeCapture Thread
                                                            ↓
                                                    Latest Frame Queue

STAGE 2: ML INFERENCE ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Frame Processing
     ├──► YOLOv8 Detector        ──► Persons, Objects, Equipment
     ├──► DeepFace Recognition   ──► Employee ID + Confidence
     ├──► PPE Detection          ──► Helmet, Vest, Gloves Status
     ├──► Centroid Tracker       ──► Track IDs & Velocity
     ├──► Fall Detection         ──► Pose Estimation + Alert
     ├──► Zone Analyzer          ──► Intrusion, Loitering, Crowding
     └──► [10 More Modules...]   ──► Aggregated Detections

STAGE 3: EVENT PROCESSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ML Results  →  Severity Classification  →  Event Assembly  →  Async Queue

STAGE 4: DATA PERSISTENCE & ALERTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Event Queue  ├─► Database Writer  ├─► WebSocket Broadcaster  ├─► Alert Manager

STAGE 5: ANALYTICS & VISUALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Database Events  ├─► React Dashboard  ├─► Analytics Engine
```

---

## 🧠 AI/ML Engine Architecture

### **Module Detection Pipeline**

```
┌────────────────────────────────────────────────────────────────────┐
│              ML INFERENCE SERVICE (Flask + Python)                  │
└────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
         ┌──────────▼──────────┐    ┌───▼──────────────┐
         │ COMPUTER VISION     │    │ TRACKING ENGINE  │
         │ ─────────────────── │    │ ──────────────── │
         │                     │    │                  │
         │ ├─ YOLOv8 Detector  │    │ ├─ BoT-SORT     │
         │ ├─ Confidence: 0.3  │    │ ├─ Centroid     │
         │ ├─ Face Embeddings  │    │ │   Matching    │
         │ └─ Output: [bbox,   │    │ └─ Track ID     │
         │           conf,cls] │    │    Persistence  │
         └──────────┬──────────┘    └────────┬────────┘
                    │                        │
         ┌──────────▼────────────────────────▼──────────┐
         │   BUSINESS LOGIC LAYER                       │
         │   ──────────────────────────                  │
         │                                              │
         │ ├─ PPE Compliance Check                      │
         │ ├─ Fall Detection Logic                      │
         │ ├─ Intrusion Detection                       │
         │ ├─ Loitering Detection                       │
         │ ├─ Crowd Density Analysis                    │
         │ └─ [10 More Detectors...]                    │
         └──────────┬───────────────────────────────────┘
                    │
         ┌──────────▼──────────────┐
         │  DETECTION RESULTS      │
         │  ──────────────────────│
         │  {                     │
         │    module: "ppe",      │
         │    label: "missing",   │
         │    confidence: 0.92,   │
         │    bbox: [x1,y1,x2,y2],│
         │    severity: "High"    │
         │  }                     │
         └────────────┬───────────┘
                      │
         ┌────────────▼────────────┐
         │  BACKEND API CLIENT     │
         │  /api/detections/stream │
         └─────────────────────────┘
```

### **14+ Detection Modules**

| Module | Input | Output | Purpose |
|--------|-------|--------|---------|
| **Face Recognition** | Video frame | Employee ID, confidence | Attendance & access control |
| **PPE Compliance** | Person bbox | Helmet, vest, gloves | Safety violations |
| **Fall Detection** | Frame + pose | Fall event, severity | Emergency alerts |
| **Fire Detection** | Frame | Fire zones | Hazard detection |
| **Intrusion** | Bboxes + zones | Zone breach | Unauthorized access |
| **Loitering** | Track IDs + time | Loitering alert | Suspicious activity |
| **Motion Tracking** | Frames | Track ID, velocity | Movement analysis |
| **Line Crossing** | Centroids | Entry/exit count | Flow monitoring |
| **Crowd Density** | All detections | Density score | Overcrowding |
| **People Count** | Persons detected | Active count | Occupancy |
| **Auto Tracking** | Frames + person | Persistent track | Person following |
| **Labour Counting** | Zone detections | Worker count | Productivity |
| **Heatmap** | Bboxes over time | Heatmap viz | Usage patterns |
| **Object Detection** | Frame | Object classes | Generic threats |

---

## 🎨 Backend API Architecture

### **FastAPI Endpoint Structure**

```
FastAPI Application
│
├─ /token                     → Login, generate JWT
├─ /users/                    → User management
├─ /cameras/                  → Camera registration & config
├─ /cameras/{id}/modules      → Enable/disable modules per camera
├─ /events/                   → Query & retrieve events
├─ /events/{id}/ack          → Acknowledge events
├─ /detections/stream        → Log detection events
├─ /ws/detections/{id}       → WebSocket real-time stream
├─ /analytics/daily          → Daily statistics
├─ /analytics/modules        → Per-module stats
├─ /health/                  → System health check
└─ /audit-logs/              → Access logs
```

### **Request/Response Flow**

```
Frontend (React)
     │
     ├─► POST /token
     │   └─► Response: {access_token, role, expires_in}
     │
     ├─► GET /cameras
     │   └─► Response: [{id, name, stream_path, modules}]
     │
     ├─► WS /ws/detections/1
     │   └─► Broadcast: {module_key, detections[], timestamp}
     │
     └─► GET /analytics/daily
         └─► Response: {total_events, critical_count, by_module{}}

Backend (FastAPI)
     │
     ├─► Middleware: JWT verification, CORS, Rate limiting
     ├─► Router: Process request → DB operation → Response
     └─► Error Handler: Structured error responses

ML Engine (Flask)
     │
     └─► POST /generate_embedding (Face recognition)
         POST /reload_faces (Sync face DB)
```

---

## 🖥️ Frontend Architecture

### **React Dashboard Structure**

```
┌─────────────────────────────────────────────────────────────────┐
│         REACT DASHBOARD (Vite + React 19 + Axios)              │
└─────────────────────────────────────────────────────────────────┘
              │
    ┌─────────┴─────────────────────────────┐
    │                                       │
    │ Authentication State (Context)        │ Main Application
    │ ├─ Token management                   │ ├─ Sidebar navigation
    │ ├─ User role verification             │ ├─ Header bar
    │ └─ Protected route guards             │ └─ Content area
    │                                       │
    └───────────────────────┬───────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼──────────┐  ┌───▼────────┐  ┌─────▼────────┐
    │ LIVE MONITOR  │  │ ANALYTICS  │  │ MANAGEMENT   │
    │ ──────────────│  │ ───────────│  │ ─────────────│
    │               │  │            │  │              │
    │ ├─ Camera     │  │ ├─ Charts  │  │ ├─ Camera    │
    │ │  Grid       │  │ │ (Recharts)  │ │  Setup     │
    │ ├─ Live Feed  │  │ ├─ Events  │  │ ├─ Module   │
    │ │ (MJPEG)     │  │ │ Timeline │  │ │  Config    │
    │ ├─ Alert      │  │ ├─ Stats   │  │ ├─ Users     │
    │ │ Panel       │  │ │ Dashboard│  │ └─ Settings  │
    │ └─ Event Log  │  │ └─ Reports │  │              │
    └──────┬────────┘  └────┬──────┘  └──────┬───────┘
           │                 │               │
           └─────────┬───────┴───────────────┘
                     │
         ┌───────────▼────────────┐
         │ HTTP CLIENT (Axios)    │
         │ ──────────────────────│
         │ ├─ Token attachment    │
         │ ├─ Error handling      │
         │ ├─ WebSocket mgmt      │
         │ └─ Interceptors        │
         └──────────┬─────────────┘
                    │
         ┌──────────▼─────────────┐
         │ FastAPI Backend        │
         │ localhost:8000         │
         └────────────────────────┘
```

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite, Recharts, Axios | Web UI & Real-time Dashboard |
| **Backend** | FastAPI, SQLAlchemy, PostgreSQL/SQLite | REST API & Business Logic |
| **ML Engine** | Flask, YOLOv8, DeepFace, TensorFlow | AI Inference & Detection |
| **Real-time** | WebSocket, Nginx, MediaMTX | Live streaming & updates |
| **Cloud** | AWS Rekognition (optional) | Enhanced face recognition |
| **DevOps** | Docker, Docker Compose | Containerized deployment |

---

## 🚀 Quick Start

### **Backend**
```bash
cd backend
pip install -r requirements.txt
# Configure .env with DATABASE_URL, SECRET_KEY, etc.
python main.py  # Runs on http://localhost:8000
```

### **ML Engine**
```bash
cd ml
pip install -r requirements.txt
# Configure .env with BACKEND_API_URL
python run_ml.py  # Runs on http://localhost:5174
```

### **Frontend**
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

---

## 🔐 Security Architecture

```
Authentication Flow
├─► Login Credentials → bcrypt hash (iteration: 12)
├─► JWT Token Generation (HS256, expires: 5 hours)
├─► Token Validation on Every Request
│   ├─ Verify signature
│   ├─ Check expiration
│   └─ Validate role permissions
└─► Role-Based Access Control
    ├─ ADMIN: Full access
    ├─ OPERATOR: View + Acknowledge
    └─ VIEWER: Read-only access
```

---

## 🗄️ Database Schema

```
Core Tables:
├─ users              (Authentication & roles)
├─ cameras            (Camera configuration)
├─ camera_modules     (Per-camera module settings)
├─ employees          (Employee DB with face embeddings)
├─ face_gallery       (Unknown faces + metadata)
├─ events             (Detection events)
├─ detections         (Detailed bbox + metadata)
└─ audit_logs         (System actions log)
```

---

## 👥 Authors

**Shiv Prakash Singh** *(AI Engineer)*  
📧 shiva.singh170304@gmail.com  
🔧 ML architecture, YOLOv8 optimization, face recognition pipeline

**Ritika Chawla** *(Full Stack Engineer)*  
📧 ritikachawla8092@gmail.com  
🔧 Backend API, React dashboard, database design, AWS integration

---

**Version:** 1.0.0 | **Last Updated:** June 2025
