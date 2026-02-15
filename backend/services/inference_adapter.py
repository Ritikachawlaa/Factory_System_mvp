from typing import Any, Dict, Optional
import logging

logger = logging.getLogger("inference")

class InferenceAdapter:
    """
    Interface for controlling external or internal ML inference engines.
    This adapter acts as the boundary between the Core Backend and the ML Logic.
    
    [REFACTORED]: ML is now external. This adapter is a stub or
    could be used to proxy commands to the ML service if needed.
    For now, process_frame is a pass-through.
    """
    
    _modules = {}

    @staticmethod
    def start_module(camera_id: int, module_key: str, config: Optional[Dict] = None) -> bool:
        """
        Signal the ML engine to start processing a specific module for a camera.
        """
        print(f"[ML-ADAPTER] Request to START module '{module_key}' on Camera {camera_id} with config: {config}")
        return True

    @staticmethod
    def stop_module(camera_id: int, module_key: str) -> bool:
        """
        Signal the ML engine to stop processing.
        """
        print(f"[ML-ADAPTER] Request to STOP module '{module_key}' on Camera {camera_id}")
        return True

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
