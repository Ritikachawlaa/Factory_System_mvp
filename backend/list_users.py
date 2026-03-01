
import database
from sqlalchemy import text

def list_users():
    conn = database.get_connection()
    try:
        rows = conn.execute(text("SELECT username, role FROM users")).fetchall()
        for r in rows:
            print(f"User: {r[0]}, Role: {r[1]}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    list_users()
