# Vision AI System - Modules Documentation

## Overview
Vision AI is a comprehensive security and surveillance system with 15 integrated modules providing real-time monitoring, analytics, and management capabilities.

---

## 1. Dashboard Module
**Purpose:** Central hub for system overview and real-time statistics

**Features:**
- Live system status display
- Real-time detection counts (faces, PPE violations, objects)
- Compliance rate monitoring
- Recent events timeline
- Quick access to all modules

**Technology:**
- React frontend with real-time data updates
- REST API integration for statistics
- Responsive glassmorphism UI design

---

## 2. Face Recognition Module
**Purpose:** Identify known employees and track unknown visitors

**Features:**
- Real-time face detection and recognition
- Employee database management
- Visitor tracking with Re-ID (Re-Identification)
- Confidence scoring for matches
- Automatic screenshot capture for unknown faces
- Detection logging with timestamps

**Technology:**
- YuNet face detector (OpenCV)
- SFace recognizer model
- SQLite database for embeddings
- Cosine similarity matching (threshold: 0.4)

**Database Tables:**
- `employees` - Known faces with embeddings
- `visitors` - Unknown faces with tracking IDs
- `detections` - All face detection logs

---

## 3. PPE (Personal Protective Equipment) Detection Module
**Purpose:** Monitor safety compliance in real-time

**Features:**
- Helmet detection
- Safety vest detection
- Safety gloves detection
- Violation logging with severity levels
- Compliance rate calculation
- Real-time alerts for violations

**Technology:**
- YOLOv8 custom-trained models
- `best_ppe.pt` - Helmet and vest detection
- `hand_yolov8n.pt` - Glove detection
- Multi-class object detection

**Detection Classes:**
- Helmet (required)
- Safety Vest (required)
- Gloves (required)

---

## 4. Camera Management Module
**Purpose:** Configure and manage camera sources

**Features:**
- Add/edit/delete cameras
- Support for multiple camera types:
  - Webcam (index 0, 1, 2...)
  - RTSP streams
  - HTTP streams
- Live preview for each camera
- Camera status monitoring
- Source validation

**Supported Formats:**
- Webcam: `0`, `1`, `2`
- RTSP: `rtsp://username:password@ip:port/stream`
- HTTP: `http://ip:port/stream`

---

## 5. Analytics Module
**Purpose:** Visualize detection data and trends

**Features:**
- Face recognition statistics
  - Known vs Unknown breakdown
  - Daily detection trends
  - Top identified individuals
- PPE compliance metrics
  - Compliance rate over time
  - Violation breakdown by type
  - Severity analysis
- Interactive charts and graphs
- Exportable reports

**Visualizations:**
- Bar charts for detection counts
- Line graphs for trends
- Pie charts for distribution
- Real-time data updates

---

## 6. Evidence Management Module
**Purpose:** Store and review security incidents

**Features:**
- Case management system
- Evidence categorization:
  - Security Breach
  - Safety Violation
  - Unauthorized Access
  - Equipment Damage
- File attachments (images, videos, documents)
- Case status tracking (Open, Under Review, Resolved, Closed)
- Priority levels (Low, Medium, High, Critical)
- Search and filter capabilities
- Detailed case notes

**Case Workflow:**
1. Create case with details
2. Attach evidence files
3. Assign priority and category
4. Track investigation progress
5. Update status and resolution

---

## 7. Attendance Module
**Purpose:** Track employee presence using face recognition

**Features:**
- Automatic check-in/check-out via face recognition
- Daily attendance records
- Attendance history with timestamps
- Department-wise filtering
- Export attendance reports
- Late arrival tracking
- Absence monitoring

**Data Tracked:**
- Employee name
- Check-in time
- Check-out time
- Total hours worked
- Department
- Date

---

## 8. User Management Module (Superadmin Only)
**Purpose:** Manage system users and access control

**Features:**
- Create new admin users
- Auto-generate credentials
- Assign departments
- Set permissions
- Delete users (except superadmin)
- View all users
- Role-based access control

**User Roles:**
- **Superadmin:** Full system access, can manage users
- **Admin:** Standard access, cannot manage users

**Permissions:**
- View Cameras
- Edit Settings
- Export Reports
- Manage Users (Superadmin only)

---

## 9. Settings Module
**Purpose:** System configuration and maintenance

**Features:**
- Storage management
  - View storage usage
  - Clear old footage
  - Check integrity
- Audit logs
  - System activity tracking
  - User action logs
  - Export logs
- System diagnostics
- Firmware information
- Backup status

**Submodules:**
- Storage Settings
- User Management (Superadmin only)
- Audit Logs
- System Configuration

---

## 10. Authentication & Authorization Module
**Purpose:** Secure access control system

**Features:**
- JWT-based authentication
- Password hashing (PBKDF2-SHA256)
- Token expiration (5 hours)
- Role-based access control (RBAC)
- Protected routes
- Session management
- Logout functionality

**Security:**
- Encrypted password storage
- Secure token generation
- CORS protection
- Route protection

**Endpoints:**
- `/token` - Login
- `/users/me` - Get current user
- `/users` - User management (protected)

---

## 11. Real-Time Video Streaming Module
**Purpose:** Live camera feed processing and display

**Features:**
- Multi-camera support
- MJPEG streaming
- Real-time detection overlay
- Bounding box visualization
- Confidence score display
- FPS monitoring
- Buffer optimization

**Technology:**
- OpenCV VideoCapture
- FastAPI streaming response
- React video player
- WebSocket support (planned)

**Stream Processing:**
1. Capture frame from camera
2. Run detection models
3. Draw bounding boxes and labels
4. Encode as JPEG
5. Stream to frontend

---

## 12. Database Management Module
**Purpose:** Data persistence and retrieval

**Features:**
- SQLite database
- CRUD operations for all entities
- Embedding storage (pickle serialization)
- Transaction management
- Data migration support
- Backup and restore

**Tables:**
- `employees` - Face embeddings
- `visitors` - Unknown face tracking
- `users` - System users
- `cameras` - Camera configurations
- `detections` - All detection logs
- `violations` - PPE violations

---

## 13. Violation Logging Module
**Purpose:** Track and manage safety violations

**Features:**
- Automatic violation detection
- Violation categorization
- Timestamp recording
- Severity classification
- Violation history
- Clear violations
- Export violation reports

**Violation Types:**
- PPE_MISSING - Missing safety equipment
- UNAUTHORIZED_ACCESS - Restricted area entry
- SAFETY_BREACH - General safety violations

**Data Stored:**
- Violation type
- Description
- Timestamp
- Associated camera
- Severity level

---

## 14. Subscription & Billing Module
**Purpose:** Manage system licensing and payments

**Features:**
- Subscription plan display
- Current plan details
- Usage statistics
- Billing history
- Payment method management
- Plan upgrade/downgrade
- Invoice generation

**Plan Tiers:**
- Basic
- Professional
- Enterprise

**Billing Cycle:**
- Monthly
- Annual (with discount)

---

## 15. Legal & Compliance Module
**Purpose:** Terms of service and privacy policy

**Features:**
- Privacy Policy page
- Terms of Service page
- GDPR compliance information
- Data retention policies
- User rights documentation
- Close/navigate functionality

**Content:**
- Data collection practices
- User consent requirements
- Data security measures
- Third-party services
- User rights and responsibilities

---

## System Architecture

### Backend (Python/FastAPI)
- **Framework:** FastAPI
- **Database:** SQLite
- **ML Models:** 
  - YuNet (Face Detection)
  - SFace (Face Recognition)
  - YOLOv8 (PPE Detection)
- **Video Processing:** OpenCV
- **Authentication:** JWT + Passlib

### Frontend (React)
- **Framework:** React 18
- **Routing:** React Router v6
- **Styling:** Vanilla CSS with glassmorphism
- **State Management:** React Context API
- **HTTP Client:** Fetch API

### Key Dependencies
**Backend:**
- `fastapi` - Web framework
- `opencv-python` - Computer vision
- `numpy` - Numerical operations
- `passlib` - Password hashing
- `python-jose` - JWT handling
- `ultralytics` - YOLO models

**Frontend:**
- `react` - UI library
- `react-router-dom` - Routing
- `vite` - Build tool

---

## API Endpoints Summary

### Authentication
- `POST /token` - Login
- `GET /users/me` - Current user info

### Users (Protected)
- `GET /users` - List all users
- `POST /users` - Create user (Superadmin only)
- `DELETE /users/{username}` - Delete user
- `PUT /users/{username}/password` - Update password

### Cameras
- `GET /cameras` - List cameras
- `POST /cameras` - Add camera
- `PUT /cameras/{id}` - Update camera
- `DELETE /cameras/{id}` - Delete camera
- `GET /stream/{cam_id}` - Video stream

### Employees
- `GET /employees` - List employees
- `POST /employees` - Add employee
- `PUT /employees/{id}` - Update employee
- `DELETE /employees/{id}` - Delete employee

### Detections & Analytics
- `GET /detections` - Recent detections
- `GET /violations` - Violation logs
- `GET /stats/face` - Face recognition stats
- `GET /stats/compliance` - PPE compliance
- `GET /stats/events` - Recent events

---

## Default Credentials

**Superadmin Account:**
- Username: `admin`
- Password: `admin123`
- Role: `superadmin`

**Important:** Change default password after first login!

---

## File Structure

```
testing/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── database.py             # Database operations
│   ├── recognition.py          # Face recognition logic
│   ├── weights/                # ML model weights
│   │   ├── best_ppe.pt
│   │   ├── hand_yolov8n.pt
│   │   ├── face_detection_yunet_2023mar.onnx
│   │   └── face_recognition_sface_2021dec.onnx
│   └── visitors/               # Unknown face screenshots
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CamerasPage.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── EvidencePage.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Subscription.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── settings/
│   │   │       ├── SettingsPage.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── StorageSettings.jsx
│   │   │       └── AuditLogs.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── public/
│       └── logo-shield.jpg
└── employees.db                # SQLite database
```

---

## Future Enhancements

1. **WebSocket Integration** - Real-time bidirectional communication
2. **Mobile App** - iOS/Android companion apps
3. **Cloud Storage** - AWS S3 integration for footage
4. **Advanced Analytics** - ML-powered insights
5. **Multi-tenant Support** - Multiple organizations
6. **Email Notifications** - Alert system
7. **Backup Automation** - Scheduled backups
8. **API Rate Limiting** - Enhanced security
9. **Audit Trail** - Comprehensive logging
10. **Export Features** - PDF/CSV reports

---

## Support & Maintenance

**System Requirements:**
- Python 3.10+
- Node.js 18+
- 8GB RAM minimum
- NVIDIA GPU (optional, for faster processing)

**Recommended:**
- 16GB RAM
- SSD storage
- Dedicated GPU
- Stable network connection

---

*Last Updated: January 18, 2026*
*Version: 1.0.0*
