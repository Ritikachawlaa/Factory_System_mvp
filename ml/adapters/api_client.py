import requests
import os
import time
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml_client")

from config import BACKEND_API_URL

class APIClient:
    def __init__(self, base_url=None):
        # Use BACKEND_API_URL as the default source for base_url
        self.base_url = base_url or BACKEND_API_URL
        self.session = requests.Session()
        logger.info(f"API Client initialized with URL: {self.base_url}")


    def _post(self, endpoint, data):
        url = f"{self.base_url}{endpoint}"
        try:
            response = self.session.post(url, json=data, timeout=5)
            response.raise_for_status()
            logger.debug(f"POST {endpoint} success: {response.status_code}")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"POST {endpoint} failed: {e}")
            return False

    def send_detection(self, event):
        """
        Send a detection event to the backend.
        event: dict with camera_id, module_key, label, confidence, etc.
        """
        # Ensure event matches DetectionSchema expected by backend
        # backend expects: camera_id, module_key, label, confidence, timestamp, metadata
        payload = {
            "camera_id": event.get("camera_id"),
            "module_key": event.get("module_key"),
            "label": event.get("label"),
            "confidence": event.get("confidence", 1.0),
            "timestamp": str(event.get("timestamp")) if event.get("timestamp") else None,
            "metadata": {"meta": event.get("meta")} if event.get("meta") else None 
            # Note: The backend schema expects `metadata: dict`. 
            # Our event logic might have `meta` as a string. Let's wrap it if needed or adjust.
            # Reading main.py: ingest_detection -> meta=str(event.metadata) if event.metadata else None
            # So if we send metadata={"meta": "some string"}, backend gets it as dict and converts to str. Perfect.
        }
        return self._post("/api/detections", payload)

    def send_heartbeat(self, camera_id, module_key, status="running"):
        payload = {
            "camera_id": camera_id,
            "status": status
        }
        return self._post(f"/api/modules/{module_key}/heartbeat", payload)

    def send_metrics(self, camera_id, inference_avg_ms):
        payload = {
            "camera_id": camera_id,
            "inference_avg_ms": inference_avg_ms
        }
        return self._post("/api/metrics/ml", payload)

    def send_detection_stream(self, camera_id: int, detections: list):
        """
        Send raw bounding boxes to the WebSocket broadcast endpoint non-blocking.
        """
        payload = {
            "camera_id": camera_id,
            "detections": detections
        }
        import threading
        def _async_stream():
            try:
                self.session.post(f"{self.base_url}/api/detections/stream", json=payload, timeout=2)
            except:
                pass
        threading.Thread(target=_async_stream, daemon=True).start()
        return True

    def get_cameras(self):
        url = f"{self.base_url}/cameras"
        try:
            response = self.session.get(url, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"GET /cameras failed: {e}")
            return []
