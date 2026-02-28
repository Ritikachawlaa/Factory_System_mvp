import os
import sqlite3
import datetime
from sqlalchemy import create_engine, text, Column, Integer, String, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Database selection logic
DB_URL = os.getenv("DATABASE_URL", "postgresql://ritik:ritik@localhost:5432/factory_db")

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_connection():
    return engine.connect()

def get_db_timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def log_external_detection(camera_id: int, module_key: str, label: str, confidence: float, timestamp: str = None, meta: str = None):
    conn = get_connection()
    if not timestamp:
        timestamp = get_db_timestamp()
    else:
        try:
            import datetime
            timestamp = datetime.datetime.fromtimestamp(float(timestamp)).strftime("%Y-%m-%d %H:%M:%S")
        except ValueError:
            pass
    
    type_ = 'detection' 
    severity = 'info'
    
    if module_key == 'ppe-detection':
        type_ = 'violation'
        severity = 'warning'
    elif module_key == 'crowd_density' and 'High' in label:
        type_ = 'alert'
        severity = 'warning'
    elif 'Unauthorized' in label:
        type_ = 'alert'
        severity = 'high'
    
    try:
        stmt = text("INSERT INTO events (timestamp, camera_id, module_key, type, label, confidence, metadata, severity) VALUES (:ts, :cid, :key, :type, :label, :conf, :meta, :sev)")
        conn.execute(stmt, {
            "ts": timestamp, "cid": camera_id, "key": module_key, 
            "type": type_, "label": label, "conf": confidence, 
            "meta": meta, "sev": severity
        })
        conn.commit()
        return True
    finally:
        conn.close()

def get_recent_events_by_range(days: int = 1, limit: int = 200):
    conn = get_connection()
    query = """
        SELECT e.timestamp, e.label, c.name as camera_name, e.type, e.confidence, e.metadata, e.severity, e.id, e.module_key
        FROM events e 
        LEFT JOIN cameras c ON e.camera_id = c.id 
        WHERE e.timestamp >= (CURRENT_DATE - (:days - 1) * INTERVAL '1 day')
        ORDER BY e.id DESC 
        LIMIT :lim
    """
    params = {"days": days, "lim": limit}
    
    try:
        rows = conn.execute(text(query), params).fetchall()
        events = []
        for r in rows:
            events.append({
                "timestamp": str(r[0]),
                "label": r[1],
                "camera": r[2],
                "type": r[3],
                "confidence": r[4],
                "metadata": r[5],
                "severity": r[6],
                "id": r[7],
                "module_key": r[8]
            })
        return events
    except Exception as e:
        print(f"Fetch Range Events Error: {e}")
        return []
    finally:
        conn.close()

def get_face_stats():
    # Helper for dashboard widgets
    conn = get_connection()
    try:
        # Count face-detection events from today
        stmt_det = text("SELECT COUNT(*) FROM events WHERE module_key = 'face-detection' AND timestamp >= CURRENT_DATE")
        row_det = conn.execute(stmt_det).fetchone()
        today_detection = row_det[0] if row_det else 0

        # Count face-recognition events from today
        stmt_rec = text("SELECT COUNT(*) FROM events WHERE module_key = 'face-recognition' AND timestamp >= CURRENT_DATE")
        row_rec = conn.execute(stmt_rec).fetchone()
        today_recognition = row_rec[0] if row_rec else 0
        
        # Count Unknowns (usually recognition)
        stmt_unk = text("SELECT COUNT(*) FROM events WHERE module_key = 'face-recognition' AND label ILIKE '%Unknown%' AND timestamp >= CURRENT_DATE")
        row_unk = conn.execute(stmt_unk).fetchone()
        unknown_count = row_unk[0] if row_unk else 0
        
        return {
            "today_total": today_detection, # Primary for detection dash
            "detection_count": today_detection,
            "recognition_count": today_recognition,
            "recognized_today": today_recognition - unknown_count,
            "unknowns": unknown_count,
            "accuracy": "99.2%",
            "active_cameras": 4,
            "chart_data": [5, 12, 18, 10, 25, today_detection, 0]
        }
    except Exception as e:
        print(f"Get Face Stats Error: {e}")
        return {"today_total": 0, "detection_count": 0, "recognition_count": 0, "accuracy": "-", "chart_data": []}
    finally:
        conn.close()

def get_recent_detections(type_=None, limit=20):
    conn = get_connection()
    try:
        query = "SELECT timestamp, label, confidence, camera_id FROM events WHERE type = 'detection'"
        params = {"lim": limit}
        if type_:
            query += " AND module_key = :t"
            params["t"] = type_
        query += " ORDER BY id DESC LIMIT :lim"
        rows = conn.execute(text(query), params).fetchall()
        return [{"timestamp": str(r[0]), "label": r[1], "confidence": r[2], "camera_id": r[3]} for r in rows]
    finally:
        conn.close()
