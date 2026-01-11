import sqlite3
import pickle
import numpy as np
import hashlib
from typing import List, Tuple, Optional

DB_NAME = "employees.db"

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

def delete_camera(cam_id: int):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM cameras WHERE id = ?", (cam_id,))
    conn.commit()
    conn.close()

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
