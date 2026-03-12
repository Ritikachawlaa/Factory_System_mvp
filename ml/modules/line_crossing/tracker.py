import numpy as np

class CentroidTracker:
    def __init__(self, max_distance=50, max_disappeared=20):
        self.next_id = 0
        self.objects = {}  # id -> centroid
        self.disappeared = {} # id -> count
        self.max_distance = max_distance
        self.max_disappeared = max_disappeared

    def register(self, centroid):
        self.objects[self.next_id] = centroid
        self.disappeared[self.next_id] = 0
        self.next_id += 1

    def deregister(self, object_id):
        if object_id in self.objects:
            del self.objects[object_id]
        if object_id in self.disappeared:
            del self.disappeared[object_id]

    def update(self, boxes):
        if len(boxes) == 0:
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)
            return self.objects

        input_centroids = []
        for (x1, y1, x2, y2) in boxes:
            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)
            input_centroids.append((cx, cy))

        if len(self.objects) == 0:
            for i in range(len(input_centroids)):
                self.register(input_centroids[i])
        else:
            used_objects = set()
            used_inputs = set()

            for i, input_c in enumerate(input_centroids):
                min_dist = float("inf")
                matched_obj = None

                for obj_id, obj_c in self.objects.items():
                    if obj_id in used_objects:
                        continue
                        
                    dist = ((input_c[0] - obj_c[0])**2 + (input_c[1] - obj_c[1])**2)**0.5
                    if dist < min_dist and dist < self.max_distance:
                        min_dist = dist
                        matched_obj = obj_id

                if matched_obj is not None:
                    self.objects[matched_obj] = input_c
                    self.disappeared[matched_obj] = 0
                    used_objects.add(matched_obj)
                    used_inputs.add(i)

            for obj_id in list(self.objects.keys()):
                if obj_id not in used_objects:
                    self.disappeared[obj_id] += 1

            for i in range(len(input_centroids)):
                if i not in used_inputs:
                    self.register(input_centroids[i])

            for obj_id in list(self.disappeared.keys()):
                if self.disappeared[obj_id] > self.max_disappeared:
                    self.deregister(obj_id)

        return self.objects
