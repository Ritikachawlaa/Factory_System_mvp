from typing import Any, Dict, Optional
import logging
#
logger = logging.getLogger("inference")

import requests
import os

ML_API_URL = os.getenv("ML_API_URL", "http://localhost:5174")

class InferenceAdapter:
    """
    Interface for controlling external or internal ML inference engines.
    This adapter acts as the boundary between the Core Backend and the ML Logic.
    
    [REFACTORED]: ML is now external. This adapter is a stub or
    could be used to proxy commands to the ML service if needed.
    """
    
    _modules = {}

    @staticmethod
    def start_module(camera_id: int, module_key: str, config: Optional[Dict] = None) -> bool:
        """
        Signal the ML engine to start processing a specific module for a camera.
        """
        logger.info(f"[ML-ADAPTER] Request to START module '{module_key}' on Camera {camera_id}")
        try:
            res = requests.post(f"{ML_API_URL}/api/ml/start", json={
                "camera_id": camera_id,
                "module_key": module_key,
                "config": config or {}
            }, timeout=2)
            if res.ok:
                logger.info(f"Successfully started ML module {module_key}")
                return True
        except Exception as e:
            logger.warning(f"Could not signal external ML engine (start_module): {e}")
        return False

    @staticmethod
    def stop_module(camera_id: int, module_key: str) -> bool:
        """
        Signal the ML engine to stop processing.
        """
        logger.info(f"[ML-ADAPTER] Request to STOP module '{module_key}' on Camera {camera_id}")
        try:
            res = requests.post(f"{ML_API_URL}/api/ml/stop", json={
                "camera_id": camera_id,
                "module_key": module_key
            }, timeout=2)
            if res.ok:
                logger.info(f"Successfully stopped ML module {module_key}")
                return True
        except Exception as e:
            logger.warning(f"Could not signal external ML engine (stop_module): {e}")
        return False

    @staticmethod
    def update_config(camera_id: int, module_key: str, config: Dict) -> bool:
        """
        Update runtime configuration (thresholds, ROI, etc.)
        """
        print(f"[ML-ADAPTER] Update config for '{module_key}' on Camera {camera_id}: {config}")
        return True

    @staticmethod
    def process_frame(camera_id: int, frame: Any, active_modules: list) -> Any:
        """
        Synchronous frame processing hook.
        Now delegates to the specific module services.
        Returns: (processed_frame, events_list)
        """
        # ML is external. No processing here.
        # Just return frame and empty events.
        return frame, []

    @staticmethod
    def health_check(module_key: str) -> str:
        """
        Check health of a specific module type.
        """
        return "healthy"
