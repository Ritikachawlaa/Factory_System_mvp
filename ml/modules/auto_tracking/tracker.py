"""
Auto Tracking – Centroid Tracker (backup / supplementary)
Source: Ai_system_phase_1_repo/HeatMap/core/tracker.py

Simple centroid tracker for re-identification when YOLO's built-in
tracker loses persistence.  The primary tracker is YOLO's own BoT-SORT.
"""
import numpy as np


class CentroidTracker:
    def __init__(self, max_distance=60):
        self.next_id = 0
        self.objects = {}        # id → (cx, cy)
        self.max_distance = max_distance

    def update(self, boxes):
        """
        boxes: list of (x1, y1, x2, y2)
        returns: dict {id: (cx, cy)}
        """
        new_objects = {}
        used_ids = set()

        for (x1, y1, x2, y2) in boxes:
            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)

            best_id = None
            min_dist = float("inf")

            for obj_id, (px, py) in self.objects.items():
                if obj_id in used_ids:
                    continue
                dist = np.linalg.norm([cx - px, cy - py])
                if dist < min_dist and dist < self.max_distance:
                    min_dist = dist
                    best_id = obj_id

            if best_id is not None:
                new_objects[best_id] = (cx, cy)
                used_ids.add(best_id)
            else:
                new_objects[self.next_id] = (cx, cy)
                used_ids.add(self.next_id)
                self.next_id += 1

        self.objects = new_objects
        return self.objects
