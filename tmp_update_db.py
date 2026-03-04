import os
import sys
from sqlalchemy import text
sys.path.append(os.path.join(os.getcwd(), 'backend'))
import database

def update_schema():
    conn = database.get_connection()
    try:
        # Check if columns exist
        print("Checking/Updating employees table...")
        
        # Add department if missing
        try:
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Engineering'"))
            print("  Added 'department' column (if missing)")
        except Exception as e:
            print(f"  Note on 'department': {e}")

        # Add status if missing
        try:
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'"))
            print("  Added 'status' column (if missing)")
        except Exception as e:
            print(f"  Note on 'status': {e}")

        # Add photo_path if missing
        try:
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_path TEXT"))
            print("  Added 'photo_path' column (if missing)")
        except Exception as e:
            print(f"  Note on 'photo_path': {e}")

        conn.commit()
        print("Schema update complete.")
        
    except Exception as e:
        print(f"FATAL ERROR: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    update_schema()
