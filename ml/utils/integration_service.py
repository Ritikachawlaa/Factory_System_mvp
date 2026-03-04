
import time
import logging

logger = logging.getLogger("integration_service")

class IntegrationService:
    """
    Maintains cross-module state, specifically mapping Track IDs to Recognized Identities.
    """
    def __init__(self):
        # track_id -> {"name": str, "last_seen": timestamp}
        self.track_identities = {}
        self.IDENTITY_TIMEOUT = 300 # Keep identity for 5 minutes if track is lost/regained

    def update_identity(self, track_id: int, name: str):
        if not name:
            return
            
        # BUG FIX: Implement Identity Hierarchy/Priority
        # Priority: Employee (Name with ID) > Visitor (Visitor #ID) > Unknown
        existing = self.get_identity(track_id)
        
        def get_priority(label):
            if label is None: return 0
            if "ID:" in label: return 3   # Employee
            if "Visitor" in label: return 2 # Visitor Gallery
            if "Unknown" in label: return 1 # Basic Unknown
            return 2 # Fallback for other names

        if get_priority(name) < get_priority(existing):
            logger.debug(f"Integration: Ignoring low-priority identity '{name}' for track {track_id} (existing: {existing})")
            return

        self.track_identities[track_id] = {
            "name": name,
            "last_seen": time.time()
        }
        logger.debug(f"Integration: Linked Track ID {track_id} to identity: {name}")

    def get_identity(self, track_id: int) -> str:
        data = self.track_identities.get(track_id)
        if data:
            # Check timeout
            if time.time() - data["last_seen"] < self.IDENTITY_TIMEOUT:
                return data["name"]
        return None

    def touch_identity(self, track_id: int):
        """Refresh TTL for an already-linked track identity."""
        if track_id in self.track_identities:
            self.track_identities[track_id]["last_seen"] = time.time()

    def cleanup(self):
        now = time.time()
        to_delete = [tid for tid, data in self.track_identities.items() 
                     if now - data["last_seen"] > self.IDENTITY_TIMEOUT]
        for tid in to_delete:
            del self.track_identities[tid]

# Global instance
integration_service = IntegrationService()
