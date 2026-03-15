import os
from pathlib import Path
from dotenv import load_dotenv

# Load local defaults first, then production overrides when enabled.
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=False)
if os.getenv("ENVIRONMENT", "development").lower() == "production":
    load_dotenv(BASE_DIR / ".env.prod", override=True)

class Config:
    # Environment
    ENV = os.getenv("ENVIRONMENT", "development") # 'development' or 'production'
    DEBUG = ENV == "development"
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        # Default to SQLite for local development if PostgreSQL is not configured
        DATABASE_URL = "sqlite:///factory_system.db"
    
    if not (DATABASE_URL.startswith("postgres") or DATABASE_URL.startswith("sqlite")):
        raise RuntimeError("Unsupported database type. Please configure a PostgreSQL or SQLite DATABASE_URL.")

    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey_dev_only")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 300))
    
    # Camera / Video
    VIDEO_SOURCE_DEFAULT = os.getenv("VIDEO_SOURCE_DEFAULT", "0")

config = Config()
