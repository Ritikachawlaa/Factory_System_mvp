import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Backend API Configuration
# BACKEND_API_URL should be set in .env or environment variables
# Requirement: Remove all hardcoded references to localhost, 127.0.0.1, etc.
# Default should be: http://localhost:8000 (development only)
ENV_BACKEND_URL = os.getenv("BACKEND_API_URL")
BACKEND_API_URL = (ENV_BACKEND_URL or "http://localhost:8000").rstrip('/')

# Production Safety Check:
# Requirement: "If BACKEND_API_URL is not set in production, raise error and exit."
if os.getenv("ENVIRONMENT") == "production" and not ENV_BACKEND_URL:
    print("❌ ERROR: BACKEND_API_URL must be set in production environment.")
    sys.exit(1)


# WebSocket Configuration
# Derive WebSocket URL dynamically from BACKEND_API_URL
if BACKEND_API_URL.startswith("https://"):
    BACKEND_WS_URL = BACKEND_API_URL.replace("https://", "wss://")
elif BACKEND_API_URL.startswith("http://"):
    BACKEND_WS_URL = BACKEND_API_URL.replace("http://", "ws://")
else:
    # Fallback or strict derivation
    BACKEND_WS_URL = BACKEND_API_URL.replace("https://", "wss://").replace("http://", "ws://")

# Model Configuration (Example)
MODEL_NAME = os.getenv("MODEL_NAME", "Facenet")

# MediaMTX RTSP Configuration
# The ML engine connects to the MediaMTX RTSP stream (not the camera directly)
# Camera source goes: Camera -> MediaMTX -> RTSP -> ML Engine
MEDIAMTX_RTSP_URL = os.getenv("MEDIAMTX_RTSP_URL", "rtsp://stream.camai.in:8554").rstrip('/')
