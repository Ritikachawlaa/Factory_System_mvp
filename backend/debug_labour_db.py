
import sqlite3
import json
from datetime import datetime

def check_labour_events():
    # Attempt to connect to local sqlite (standard for this MVP)
    try:
        conn = sqlite3.connect('factory_system.db')
        cursor = conn.cursor()
        
        print("--- Recent Labour Counting Events ---")
        cursor.execute("""
            SELECT id, timestamp, metadata 
            FROM events 
            WHERE module_key = 'labour-counting' 
            ORDER BY id DESC LIMIT 5
        """)
        rows = cursor.fetchall()
        for row in rows:
            print(f"ID: {row[0]} | TS: {row[1]}")
            print(f"Metadata: {row[2]}")
            print("-" * 20)
            
        print("\n--- Analytics Query Test ---")
        # Test the specific query used in database.py
        query = "SELECT metadata FROM events WHERE module_key = 'labour-counting' AND timestamp >= datetime('now', '-5 minutes') ORDER BY id DESC LIMIT 1"
        cursor.execute(query)
        row = cursor.fetchone()
        if row:
            print(f"Latest 5min Metadata: {row[0]}")
            try:
                full_metadata = json.loads(row[0]) if isinstance(row[0], str) else row[0]
                meta = full_metadata.get("meta", {})
                print(f"Extracted 'meta': {meta}")
            except Exception as e:
                print(f"Parse Error: {e}")
        else:
            print("No events in last 5 minutes.")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_labour_events()
