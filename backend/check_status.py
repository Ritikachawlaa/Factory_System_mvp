
import psycopg2
import pickle
import os
import json

DATABASE_URL = "postgresql://camai_user:RitikaCamai123@localhost:5432/camai_db"

def check_status():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Check employees
        cur.execute("SELECT id, name FROM employees;")
        emps = cur.fetchall()
        print(f"--- Employees Table ({len(emps)} records) ---")
        for e in emps:
            print(f"ID: {e[0]}, Name: {e[1]}")
            
        # Check gallery
        cur.execute("SELECT id, name, emp_id, first_seen FROM face_gallery ORDER BY id DESC LIMIT 20;")
        gall = cur.fetchall()
        print(f"\n--- Face Gallery (Last 20 of total records) ---")
        for g in gall:
            print(f"ID: {g[0]}, Name: {g[1]}, EmpID: {g[2]}, Seen: {g[3]}")
            
        cur.execute("SELECT COUNT(*) FROM face_gallery;")
        total_gall = cur.fetchone()[0]
        print(f"\nTotal Gallery Entries: {total_gall}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_status()
