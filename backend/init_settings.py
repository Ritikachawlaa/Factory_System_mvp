from database import get_connection, text
import sys

def init():
    conn = get_connection()
    try:
        conn.execute(text('CREATE TABLE IF NOT EXISTS system_settings (key VARCHAR(100) PRIMARY KEY, value TEXT)'))
        conn.execute(text('INSERT INTO system_settings (key, value) VALUES (:key, :val) ON CONFLICT (key) DO NOTHING'), 
                     {"key": "critical_modules", "val": '["ppe-compliance", "intrusion-detection"]'})
        conn.commit()
        print('system_settings table created and initialized')
    except Exception as e:
        print(f'Error: {e}')
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    init()
