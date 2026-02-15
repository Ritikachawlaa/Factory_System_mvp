import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Backend API Configuration
# Default to localhost for development if not set
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5174").rstrip('/')

# WebSocket Configuration
# Derive WebSocket URL from API URL
if BACKEND_API_URL.startswith("https://"):
    BACKEND_WS_URL = BACKEND_API_URL.replace("https://", "wss://")
elif BACKEND_API_URL.startswith("http://"):
    BACKEND_WS_URL = BACKEND_API_URL.replace("http://", "ws://")
else:
    # Fallback or assume ws if no protocol given (unlikely for valid URL)
    BACKEND_WS_URL = f"ws://{BACKEND_API_URL}"

# Model Configuration (Example)
MODEL_NAME = os.getenv("MODEL_NAME", "Facenet")
