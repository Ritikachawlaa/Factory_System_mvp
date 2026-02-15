from collections import defaultdict, Counter

class IdentityCache:
    def __init__(self, confirm_frames=1):
        self.locked = {}
        self.votes = defaultdict(list)

    def update(self, track_id, name):

        if track_id in self.locked:
            return self.locked[track_id]

        if name == "Unknown":
            return "Unknown"

        self.votes[track_id].append(name)

        if len(self.votes[track_id]) >= 1:
            final = Counter(self.votes[track_id]).most_common(1)[0][0]
            self.locked[track_id] = final
            return final

        return "Detecting..."
