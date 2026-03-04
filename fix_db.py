import sqlite3
import os

db_path = "/home/ubuntu/Factory_System_mvp/backend/employees.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("UPDATE cameras SET stream_path = 'camera1' WHERE id = 16")
    conn.commit()
    print("Update successful")
    cur.execute("SELECT id, stream_path FROM cameras WHERE id = 16")
    print(cur.fetchone())
else:
    print("DB not found at " + db_path)
