
import os
import sys
from passlib.context import CryptContext
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load .env for DATABASE_URL
load_dotenv()

# Match the hashing config from main.py
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def reset_password(username, new_password):
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("Error: DATABASE_URL not found in environment or .env file.")
        return

    try:
        engine = create_engine(database_url)
        with engine.connect() as conn:
            # Check if user exists
            stmt_check = text("SELECT username FROM users WHERE username = :u")
            user = conn.execute(stmt_check, {"u": username}).fetchone()
            
            if not user:
                print(f"Error: User '{username}' not found in the database.")
                return

            # Update password
            new_hash = get_password_hash(new_password)
            stmt_update = text("UPDATE users SET password_hash = :p WHERE username = :u")
            conn.execute(stmt_update, {"p": new_hash, "u": username})
            conn.commit()
            
            print(f"Successfully updated password for user '{username}' to '{new_password}'.")
            
    except Exception as e:
        print(f"Failed to reset password: {e}")

if __name__ == "__main__":
    new_pwd = "Ritika@12"
    reset_password("admin", new_pwd)
