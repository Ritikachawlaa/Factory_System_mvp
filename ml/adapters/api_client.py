import requests
import os
import time
import logging
import threading
from queue import Queue, Empty

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml_client")

from config import BACKEND_API_URL

class APIClient:
    def __init__(self, base_url=None):
        # Use BACKEND_API_URL as the default source for base_url
        self.base_url = base_url or BACKEND_API_URL
        self.session = requests.Session()
        
        # Performance optimization: Streamer Queue
        self._stream_queue = Queue(maxsize=10) # Keep small to ensure real-time
        self._streaming_active = True
        self._stream_thread = threading.Thread(target=self._stream_worker, daemon=True)
        self._stream_thread.start()
        
        logger.info(f"API Client initialized with URL: {self.base_url}")

    def _stream_worker(self):
        """Persistent worker to send detection frames without spawning threads."""
        while self._streaming_active:
            try:
                # Get the latest payload, skip if queue backed up
                payload = self._stream_queue.get(timeout=1.0)
                try:
                    res = self.session.post(f"{self.base_url}/api/detections/stream", json=payload, timeout=2.0)
                    if not res.ok:
                        logger.warning(f"Stream POST failed: {res.status_code}")
                except Exception as e:
                    logger.debug(f"Stream worker transient error: {e}")
                self._stream_queue.task_done()
            except Empty:
                continue
            except Exception as e:
                logger.error(f"Stream worker error: {e}")

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
        payload = {
            "camera_id": event.get("camera_id"),
            "module_key": event.get("module_key"),
            "label": event.get("label"),
            "confidence": event.get("confidence", 1.0),
            "timestamp": str(event.get("timestamp")) if event.get("timestamp") else None,
            "metadata": {"meta": event.get("meta")} if event.get("meta") else None 
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
        Queue raw bounding boxes for the worker thread to send.
        """
        payload = {
            "camera_id": camera_id,
            "detections": detections
        }
        
        # If queue full, drop older frame to keep latency low
        if self._stream_queue.full():
            try:
                self._stream_queue.get_nowait()
                self._stream_queue.task_done()
            except Empty:
                pass
                
        self._stream_queue.put(payload)
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
