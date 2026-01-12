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
    
    # Cameras table
    c.execute('''CREATE TABLE IF NOT EXISTS cameras
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, source TEXT)''')
    
    # Violations table
    c.execute('''CREATE TABLE IF NOT EXISTS violations
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, type TEXT, description TEXT)''')
                 
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

def delete_camera(cam_id: int):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM cameras WHERE id = ?", (cam_id,))
    conn.commit()
    conn.close()

# --- Violations ---
def log_violation(v_type: str, description: str):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    import datetime
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    c.execute("INSERT INTO violations (timestamp, type, description) VALUES (?, ?, ?)", (timestamp, v_type, description))
    conn.commit()
    conn.close()

def get_violations(limit=50):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, timestamp, type, description FROM violations ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [{"id": r[0], "timestamp": r[1], "type": r[2], "description": r[3]} for r in rows]

# --- User Auth ---
def create_user(username, password_hash):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, password_hash))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_user(username):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT username, password_hash FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()
    return row # (username, password_hash) or None
    
def get_all_users():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, username FROM users")
    rows = c.fetchall()
    conn.close()
    return [{"id": r[0], "username": r[1]} for r in rows]

if __name__ == "__main__":
    init_db()
