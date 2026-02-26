import sqlite3
import json

db_path = "/home/ubuntu/Factory_System_mvp/backend/db.sqlite3"

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Insert or update camera 1
    cur.execute("INSERT OR REPLACE INTO cameras (id, name, source, stream_path) VALUES (1, 'Simulated Camera', 'camera1', 'camera1')")
    
    # Insert or update a module for camera 1
    # Check if table has 'config' column
    cur.execute("PRAGMA table_info(camera_modules)")
    columns = [col[1] for col in cur.fetchall()]
    
    if 'config' in columns:
        cur.execute("INSERT OR REPLACE INTO camera_modules (camera_id, module_key, status, config) VALUES (1, 'people_count', 'active', '{}')")
    else:
        cur.execute("INSERT OR REPLACE INTO camera_modules (camera_id, module_key, status) VALUES (1, 'people_count', 'active')")
        
    conn.commit()
    conn.close()
    
    print("Database updated successfully for simulated stream.")
except Exception as e:
    print(f"Failed to update database: {e}")
