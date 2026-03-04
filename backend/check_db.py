
import psycopg2
import os

DATABASE_URL = "postgresql://camai_user:RitikaCamai123@localhost:5432/camai_db"

def query_employees():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM employees;")
        rows = cur.fetchall()
        print("Employee Records:")
        for row in rows:
            print(f"ID: {row[0]}, Name: {row[1]}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    query_employees()
