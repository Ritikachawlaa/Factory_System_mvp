# Factory Safety Detection System

A comprehensive AI-powered safety monitoring system for factory environments, featuring real-time detection and monitoring capabilities.

## Features

### Core Modules
- **Face Recognition** - Employee identification and visitor tracking
- **PPE Compliance Detection** - Real-time monitoring of safety equipment (helmets, vests, gloves)
- **Fall Detection** - Automatic detection of workplace accidents
- **Fire Detection** - Early fire hazard identification
- **Loitering Detection** - Unauthorized presence monitoring
- **Motion Tracking** - Movement pattern analysis
- **Camera Tampering Detection** - Security camera integrity monitoring
- **Fault Detection** - Equipment malfunction identification

### System Features
- Role-Based Access Control (RBAC)
- Real-time video streaming and analysis
- Comprehensive audit logging
- Attendance tracking
- Safety violation alerts
- Analytics and reporting dashboard
- Multi-camera support

## Tech Stack

### Backend
- FastAPI
- Python
- SQLite Database
- YOLOv8/YOLOv5 for object detection
- OpenCV for video processing

### Frontend
- React
- Modern UI with responsive design
- Real-time video feed display
- Interactive dashboards

## Project Structure

```
├── backend/           # FastAPI backend server
├── frontend/          # React frontend application
├── employees.db       # SQLite database
└── MODULES_DOCUMENTATION.md  # Detailed module documentation
```

## Getting Started

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Documentation

For detailed module documentation, see [MODULES_DOCUMENTATION.md](MODULES_DOCUMENTATION.md)

## Author

Ritik Chawla (ritikachawla8092@gmail.com)

## Last Updated

January 21, 2026
