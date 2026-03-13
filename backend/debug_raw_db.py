
import psycopg2
import json

def debug_labour_raw():
    try:
        conn = psycopg2.connect("dbname=camai_db user=camai_user password=RitikaCamai123 host=localhost")
        cur = conn.cursor()
        
        print("--- ALL Labour Counting Events ---")
        cur.execute("SELECT id, timestamp, module_key, label, metadata FROM events WHERE module_key = 'labour-counting' ORDER BY id DESC LIMIT 10")
        rows = cur.fetchall()
        if not rows:
            print("NO LABOUR COUNTING EVENTS FOUND IN DB.")
        else:
            for row in rows:
                print(f"ID: {row[0]} | TS: {row[1]} (Type: {type(row[1])}) | Label: {row[3]}")
                print(f"Metadata: {row[4]}")
                print("-" * 20)
                
        print("\n--- Current DB Time ---")
        cur.execute("SELECT NOW(), CURRENT_TIMESTAMP, LOCALTIMESTAMP")
        db_times = cur.fetchone()
        print(f"NOW(): {db_times[0]} | CURRENT_TIMESTAMP: {db_times[1]} | LOCALTIMESTAMP: {db_times[2]}")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_labour_raw()
