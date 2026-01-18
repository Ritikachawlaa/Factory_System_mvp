import sqlite3
import pickle
import numpy as np
import hashlib
import os
from typing import List, Tuple, Optional

# Use absolute path to ensure we always use the same DB file (in project root)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_NAME = os.path.join(BASE_DIR, "employees.db")

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS employees
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, embedding BLOB)''')
    
    # User User/Password table for Dashboard Access
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password_hash TEXT)''')
    
    # Check if 'role' column exists in users, if not add it
    c.execute("PRAGMA table_info(users)")
    columns = [info[1] for info in c.fetchall()]
    if 'role' not in columns:
        print("Migrating DB: Adding 'role' column to users table...")
        c.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'admin'")
    
    # Cameras table
    c.execute('''CREATE TABLE IF NOT EXISTS cameras
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, source TEXT)''')
    
    # Violations table
    c.execute('''CREATE TABLE IF NOT EXISTS violations
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, type TEXT, description TEXT)''')

    # Detections table (General purpose for Face, Object, Plate)
    c.execute('''CREATE TABLE IF NOT EXISTS detections
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  timestamp TEXT, 
                  type TEXT,      -- 'face', 'object', 'plate', 'motion'
                  label TEXT,     -- 'John Doe', 'Car', 'ABC-123'
                  confidence REAL, 
                  camera_id INTEGER)''')
                  
    # Visitors table for Unknown Face Re-ID
    c.execute('''CREATE TABLE IF NOT EXISTS visitors
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  tracking_id TEXT UNIQUE,  -- 'Visitor_1', 'Visitor_2'
                  embedding BLOB, 
                  first_seen TEXT, 
                  screenshot_path TEXT)''')
                  
                  
    conn.commit()
    conn.close()

# --- Employees ---
def add_employee(name: str, embedding: np.ndarray):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    embedding_bytes = pickle.dumps(embedding)
    c.execute("INSERT INTO employees (name, embedding) VALUES (?, ?)", (name, embedding_bytes))
    conn.commit()
    conn.close()
    
def get_all_employees() -> List[Tuple[str, np.ndarray, int]]:
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT name, embedding, id FROM employees")
    rows = c.fetchall()
    conn.close()
    
    employees = []
    for name, emb_bytes, emp_id in rows:
        embedding = pickle.loads(emb_bytes)
        employees.append((name, embedding, emp_id))
    return employees

def delete_employee(emp_id: int):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM employees WHERE id = ?", (emp_id,))
    conn.commit()
    conn.close()

def update_employee(emp_id: int, name: str):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("UPDATE employees SET name = ? WHERE id = ?", (name, emp_id))
    conn.commit()
    conn.close()

# --- Cameras ---
def add_camera(name: str, source: str):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO cameras (name, source) VALUES (?, ?)", (name, source))
    conn.commit()
    conn.close()

def get_cameras():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, name, source FROM cameras")
    rows = c.fetchall()
    conn.close()
    return [{"id": r[0], "name": r[1], "source": r[2]} for r in rows]

def get_camera_by_id(cam_id: int):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, name, source FROM cameras WHERE id = ?", (cam_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return {"id": row[0], "name": row[1], "source": row[2]}
    return None

def delete_camera(cam_id: int):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM cameras WHERE id = ?", (cam_id,))
    conn.commit()
    conn.close()

def update_camera(cam_id: int, name: str, source: str):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("UPDATE cameras SET name = ?, source = ? WHERE id = ?", (name, source, cam_id))
    conn.commit()
    conn.close()

# --- Visitors ---
def add_visitor(tracking_id: str, embedding: np.ndarray, screenshot_path: str):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    import datetime
    first_seen = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    embedding_bytes = pickle.dumps(embedding)
    c.execute("INSERT INTO visitors (tracking_id, embedding, first_seen, screenshot_path) VALUES (?, ?, ?, ?)", 
              (tracking_id, embedding_bytes, first_seen, screenshot_path))
    conn.commit()
    conn.close()

def get_all_visitors():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT tracking_id, embedding, first_seen, screenshot_path, id FROM visitors")
    rows = c.fetchall()
    conn.close()
    
    visitors = []
    for r in rows:
        embedding = pickle.loads(r[1])
        visitors.append({
            "tracking_id": r[0],
            "embedding": embedding,
            "first_seen": r[2],
            "screenshot_path": r[3],
            "id": r[4]
        })
    return visitors

# --- Violations ---
def log_violation(v_type: str, description: str):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    import datetime
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    c.execute("INSERT INTO violations (timestamp, type, description) VALUES (?, ?, ?)", (timestamp, v_type, description))
    conn.commit()
    conn.close()

def clear_violations():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM violations")
    conn.commit()
    conn.close()

def get_violations(limit=50):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, timestamp, type, description FROM violations ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [{"id": r[0], "timestamp": r[1], "type": r[2], "description": r[3]} for r in rows]

# --- Detections Generic ---
def log_detection(type: str, label: str, confidence: float, camera_id: int = 1):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    import datetime
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    c.execute("INSERT INTO detections (timestamp, type, label, confidence, camera_id) VALUES (?, ?, ?, ?, ?)", 
              (timestamp, type, label, confidence, camera_id))
    conn.commit()
    conn.close()

def get_recent_detections(type_filter: str = None, limit=20):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    if type_filter:
        c.execute("SELECT id, timestamp, type, label, confidence, camera_id FROM detections WHERE type = ? ORDER BY id DESC LIMIT ?", (type_filter, limit))
    else:
        c.execute("SELECT id, timestamp, type, label, confidence, camera_id FROM detections ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [{
        "id": r[0], 
        "timestamp": r[1], 
        "type": r[2], 
        "label": r[3], 
        "confidence": r[4], 
        "camera_id": r[5]
    } for r in rows]

# --- Stats / Analytics Helpers ---
def get_detection_stats_by_type():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT label, COUNT(*) FROM detections WHERE type='object' GROUP BY label")
    rows = c.fetchall()
    conn.close()
    return {r[0]: r[1] for r in rows}

def get_detection_history_last_7_days():
    import datetime
    days = []
    counts = []
    today = datetime.date.today()
    for i in range(6, -1, -1):
        d = today - datetime.timedelta(days=i)
        days.append(d.strftime("%a"))
        counts.append(int(np.random.randint(20, 100))) 
    return {"labels": days, "data": counts}

def get_face_stats():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM detections WHERE type='face' AND date(timestamp) = date('now')")
    today_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM detections WHERE type='face' AND label LIKE 'Visitor_%'")
    unknown_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM detections WHERE type='face' AND label NOT LIKE 'Visitor_%'")
    known_count = c.fetchone()[0]
    
    conn.close()
    return {
        "today_total": today_count,
        "known": known_count,
        "unknown": unknown_count,
        "chart_data": [int(x) for x in np.random.randint(20, 100, 7)] 
    }

def get_compliance_stats():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    c.execute("SELECT COUNT(DISTINCT label) FROM detections WHERE type='face' AND date(timestamp) = date('now')")
    people_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM violations WHERE type='PPE_MISSING' AND date(timestamp) = date('now')")
    violation_count = c.fetchone()[0]
    
    conn.close()
    
    if people_count == 0:
        return 100
        
    penalty = violation_count * 5
    rate = 100 - penalty
    
    rate = max(0, min(100, int(rate)))
    return rate

def get_recent_events(limit=5):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''SELECT d.timestamp, d.label, c.name 
                 FROM detections d 
                 LEFT JOIN cameras c ON d.camera_id = c.id 
                 ORDER BY d.id DESC LIMIT ?''', (limit,))
    rows = c.fetchall()
    conn.close()
    
    events = []
    if not rows:
        return []
        
    for r in rows:
        time_str = r[0].split(' ')[1]
        cam_name = r[2] if r[2] else "System"
        msg = f"{cam_name}: {r[1]} detected"
        if "Visitor" in r[1]:
             msg = f"{cam_name}: Unknown face detected"
        events.append({"message": msg, "time": time_str})
    return events

# --- User Auth ---
def create_user(username, password_hash, role="admin"):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", (username, password_hash, role))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_user(username):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT username, password_hash, role FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()
    return row # (username, password_hash, role) or None
    
def get_all_users():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, username, role FROM users")
    rows = c.fetchall()
    conn.close()
    return [{"id": r[0], "username": r[1], "role": r[2]} for r in rows]

def delete_user(username: str):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM users WHERE username = ?", (username,))
    deleted = c.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def update_password(username: str, new_password_hash: str):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("UPDATE users SET password_hash = ? WHERE username = ?", (new_password_hash, username))
    updated = c.rowcount > 0
    conn.commit()
    conn.close()
    return updated

if __name__ == "__main__":
    init_db()
