
import psycopg2
import json
from datetime import datetime, timedelta

def check_labour_events_pg():
    # Try different connection strings
    conns = [
        "dbname=camai_db user=camai_user password=RitikaCamai123 host=localhost",
        "dbname=camai_db user=camai_user password=RitikaCamai123", # Local socket
        "dbname=camai_db user=camai_user password=RitikaCamai123 host=127.0.0.1"
    ]
    
    conn = None
    for ds in conns:
        try:
            print(f"Attempting connection: {ds.split('password')[0]}...")
            conn = psycopg2.connect(ds)
            print("Connected successfully!")
            break
        except Exception as e:
            print(f"Failed: {e}")
            
    if not conn:
        print("Could not connect to PostgreSQL. Please check if it's running.")
        return

    try:
        cur = conn.cursor()
        
        # 1. Check if table exists
        cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events')")
        if not cur.fetchone()[0]:
            print("Table 'events' does not exist in camai_db!")
            return

        print("--- Recent Labour Counting Events (PostgreSQL) ---")
        cur.execute("""
            SELECT id, timestamp, metadata 
            FROM events 
            WHERE module_key = 'labour-counting' 
            ORDER BY id DESC LIMIT 5
        """)
        rows = cur.fetchall()
        for row in rows:
            print(f"ID: {row[0]} | TS: {row[1]}")
            print(f"Metadata: {row[2]}")
            print("-" * 20)
            
        print("\n--- Analytics Query Test (database.py logic) ---")
        # Test the specific query used in database.py
        query = "SELECT metadata FROM events WHERE module_key = 'labour-counting' AND timestamp >= (NOW() - INTERVAL '30 minutes') ORDER BY id DESC LIMIT 1"
        cur.execute(query)
        row = cur.fetchone()
        if row:
            print(f"Query (last 30min) Result Found.")
            full_metadata = row[0]
            if isinstance(full_metadata, str):
                full_metadata = json.loads(full_metadata)
            meta = full_metadata.get("meta", {})
            print(f"Extracted 'meta': {meta}")
        else:
            print("No events in last 30 minutes.")

        # Check total today
        cur.execute("SELECT COUNT(*) FROM events WHERE module_key = 'labour-counting' AND timestamp >= CURRENT_DATE")
        today_count = cur.fetchone()[0]
        print(f"\nTotal events today: {today_count}")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error during queries: {e}")

if __name__ == "__main__":
    check_labour_events_pg()
