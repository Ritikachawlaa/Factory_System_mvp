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
        
        # Performance optimization: General Telemetry Queue
        self._telemetry_queue = Queue(maxsize=100) 
        self._streaming_active = True
        self._telemetry_thread = threading.Thread(target=self._telemetry_worker, daemon=True)
        self._telemetry_thread.start()
        
        # Dedicated Streaming Queue for Real-time Boxes
        self._stream_queue = Queue(maxsize=5) 
        self._stream_thread = threading.Thread(target=self._stream_worker, daemon=True)
        self._stream_thread.start()
        
        logger.info(f"API Client initialized with URL: {self.base_url}")

    def _telemetry_worker(self):
        """Background worker for heartbeats, metrics, and standard detections."""
        while self._streaming_active:
            try:
                endpoint, payload = self._telemetry_queue.get(timeout=1.0)
                try:
                    self.session.post(f"{self.base_url}{endpoint}", json=payload, timeout=2.0)
                except Exception as e:
                    logger.debug(f"Telemetry worker error for {endpoint}: {e}")
                self._telemetry_queue.task_done()
            except Empty:
                continue

    def _stream_worker(self):
        """Persistent worker to send detection frames without spawning threads."""
        while self._streaming_active:
            try:
                # 1. Wait for at least one item
                payload = self._stream_queue.get(timeout=1.0)
                
                # 2. Optimization: Drain the queue to only send the LATEST frame
                while not self._stream_queue.empty():
                    try:
                        payload = self._stream_queue.get_nowait()
                        self._stream_queue.task_done()
                    except Empty:
                        break
                
                try:
                    self.session.post(f"{self.base_url}/api/detections/stream", json=payload, timeout=1.0)
                except Exception as e:
                    logger.debug(f"Stream worker transient error: {e}")
                
                self._stream_queue.task_done()
            except Empty:
                continue
            except Exception as e:
                logger.error(f"Stream worker error: {e}")

    def _post_async(self, endpoint, data):
        """Non-blocking post."""
        if self._telemetry_queue.full():
            try:
                self._telemetry_queue.get_nowait()
                self._telemetry_queue.task_done()
            except Empty:
                pass
        self._telemetry_queue.put((endpoint, data))
        return True

    def _post(self, endpoint, data):
        """Blocking post (use sparingly)."""
        url = f"{self.base_url}{endpoint}"
        try:
            response = self.session.post(url, json=data, timeout=5)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"POST {endpoint} failed: {e}")
            return False

    def send_detection(self, event):
        payload = {
            "camera_id": event.get("camera_id"),
            "module_key": event.get("module_key"),
            "label": event.get("label"),
            "confidence": event.get("confidence", 1.0),
            "timestamp": str(event.get("timestamp")) if event.get("timestamp") else None,
            "metadata": {"meta": event.get("meta")} if event.get("meta") else None 
        }
        return self._post_async("/api/detections", payload)

    def send_heartbeat(self, camera_id, module_key, status="running"):
        payload = {
            "camera_id": camera_id,
            "status": status
        }
        return self._post_async(f"/api/modules/{module_key}/heartbeat", payload)

    def send_metrics(self, camera_id, inference_avg_ms):
        payload = {
            "camera_id": camera_id,
            "inference_avg_ms": inference_avg_ms
        }
        return self._post_async("/api/metrics/ml", payload)

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
                
        if len(detections) > 0:
            logger.info(f"DEBUG: Queuing {len(detections)} detections for camera {camera_id}")
            
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

    def get_setting(self, key):
        url = f"{self.base_url}/settings/{key}"
        try:
            response = self.session.get(url, timeout=5)
            response.raise_for_status()
            return response.json().get("value")
        except requests.exceptions.RequestException as e:
            logger.error(f"GET /settings/{key} failed: {e}")
            return None
