import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Backend API Configuration
# BACKEND_BASE_URL should be set in .env (e.g., http://<BACKEND_HOST>:<PORT>)
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "").rstrip('/')

if not BACKEND_BASE_URL:
    # In production, this should be set via environment variable.
    print("WARNING: BACKEND_BASE_URL is not set in environment variables.")

# WebSocket Configuration
# Derive WebSocket URL from Base URL
if BACKEND_BASE_URL.startswith("https://"):
    BACKEND_WS_URL = BACKEND_BASE_URL.replace("https://", "wss://")
elif BACKEND_BASE_URL.startswith("http://"):
    BACKEND_WS_URL = BACKEND_BASE_URL.replace("http://", "ws://")
else:
    BACKEND_WS_URL = f"ws://{BACKEND_BASE_URL}" if BACKEND_BASE_URL else ""

# Model Configuration (Example)
MODEL_NAME = os.getenv("MODEL_NAME", "Facenet")
