import sqlite3
import pickle
import numpy as np
import hashlib
from typing import List, Tuple

DB_NAME = "employees.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS employees
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, embedding BLOB)''')
    
    # User User/Password table for Dashboard Access
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password_hash TEXT)''')
                 
    conn.commit()
    conn.close()

def add_employee(name: str, embedding: np.ndarray):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    embedding_bytes = pickle.dumps(embedding)
    c.execute("INSERT INTO employees (name, embedding) VALUES (?, ?)", (name, embedding_bytes))
    conn.commit()
    conn.close()
    
def get_all_employees() -> List[Tuple[str, np.ndarray]]:
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT name, embedding FROM employees")
    rows = c.fetchall()
    conn.close()
    
    employees = []
    for name, emb_bytes in rows:
        embedding = pickle.loads(emb_bytes)
        employees.append((name, embedding))
    return employees

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

if __name__ == "__main__":
    init_db()
