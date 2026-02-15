import time
from collections import defaultdict, Counter
# import database

class PresenceManager:
    def __init__(self, confirm_frames=3, exit_delay=60):
        self.locked = {}                 # track_id -> name
        self.votes = defaultdict(list)
        self.present = {}                # track_id -> last_seen_time
        self.confirm_frames = confirm_frames
        self.exit_delay = exit_delay

    def update_identity(self, track_id, name, camera_id=0):
        if track_id in self.locked:
            return self.locked[track_id], None

        if name == "Unknown":
            # Still count unknown? Source says return "Unknown" but doesn't log it?
            # Source: `if name == "Unknown": return "Unknown"`
            return "Unknown", None

        self.votes[track_id].append(name)

        if len(self.votes[track_id]) >= self.confirm_frames:
            final = Counter(self.votes[track_id]).most_common(1)[0][0]
            self.locked[track_id] = final

            # Log Entry
            # database.log_external_detection(...)
            # "Entry" event
            event = {
                "camera_id": camera_id, 
                "module_key": "region_entrance", 
                "label": "Region Entry", 
                "confidence": 1.0, 
                "meta": f"{final} entered"
            }

            self.present[track_id] = time.time()
            if track_id in self.votes:
                del self.votes[track_id]

            return final, event

        return "Detecting...", None

    def seen(self, track_id):
        self.present[track_id] = time.time()

    def check_exit(self, camera_id=0):
        now = time.time()
        events = []
        for track_id in list(self.present.keys()):
            last_seen = self.present[track_id]

            if now - last_seen >= self.exit_delay:
                name = self.locked.get(track_id, "Unknown")
                
                # Log Exit
                event = {
                    "camera_id": camera_id, 
                    "module_key": "region_entrance", 
                    "label": "Region Exit", 
                    "confidence": 1.0, 
                    "meta": f"{name} exited"
                }
                events.append(event)

                self.present.pop(track_id)
                self.locked.pop(track_id, None)
                
        return events
