import numpy as np

class CentroidTracker:
    def __init__(self, max_distance=50):
        self.next_id = 0
        self.objects = {}  # id -> centroid
        self.max_distance = max_distance

    def update(self, boxes):
        new_objects = {}
        used_ids = set()
        
        # Calculate centroids
        centroids = []
        for (x1, y1, x2, y2) in boxes:
            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)
            centroids.append((cx, cy))

        # Basic tracking logic: match existing objects to new centroids
        # Logic from source was slightly flawed looping (nested loop without full assignment).
        # Correct logic usually computes all distances then optimized assignment (Hungarian).
        # But source logic:
        # for frame_obj in boxes: find best match in self.objects.
        # This is greedy but simple.
        
        # Re-implementing source logic exactly as read:
        # for (x1...y2) in boxes: ... find match ...
        
        input_centroids = centroids # just using computed list

        # If no objects exist yet, register all
        if len(self.objects) == 0:
            for i in range(len(input_centroids)):
                self.objects[self.next_id] = input_centroids[i]
                self.next_id += 1
            return self.objects

        # Match existing objects to input centroids
        # Source code had logic iterating over BOXES/CENTROIDS and finding best match in OBJECTS.
        # This allows multiple input centroids to grab different objects? Or maybe same object?
        # Code:
        # for (x1...y2) in boxes:
        #    ...
        #    for obj_id, (px, py) in self.objects.items(): ... find min_dist ...
        #    if matched_id: update new_objects[matched_id] ... used_ids.add ...
        #    else: register new ...
        
        # Issue: Multiple new centroids could grab the same old object if closest?
        # Source code check: `if obj_id in used_ids: continue`
        # So it prevents re-using same old object.
        # But order of processing boxes matters. Greedy.
        # It's fine for simple use.
        
        for (cx, cy) in input_centroids:
            min_dist = float("inf")
            matched_id = None

            for obj_id, (px, py) in self.objects.items():
                if obj_id in used_ids:
                    continue
                
                # Numpy norm might be slow in loop? 
                # dist = np.linalg.norm([cx - px, cy - py])
                # Manually:
                dist = ((cx - px)**2 + (cy - py)**2)**0.5
                
                if dist < min_dist and dist < self.max_distance:
                    min_dist = dist
                    matched_id = obj_id

            if matched_id is not None:
                new_objects[matched_id] = (cx, cy)
                used_ids.add(matched_id)
            else:
                new_objects[self.next_id] = (cx, cy)
                used_ids.add(self.next_id)
                self.next_id += 1

        self.objects = new_objects.copy() # copy to be safe
        return self.objects
