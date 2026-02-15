class CentroidTracker:
    def __init__(self, max_distance=60):
        self.next_id = 0
        self.objects = {}

    def update(self, boxes):
        new_objects = {}

        # Simple ID assignment logic (placeholder for real tracking)
        # This implementation in the source manual was very basic,
        # mapping boxes to IDs purely by order or dummy logic?
        # The source provided:
        # for (x1, y1, x2, y2) in boxes:
        #     cx = ...
        #     new_objects[self.next_id] = (cx, cy)
        #     self.next_id += 1
        # self.objects = new_objects
        
        # This logic assigns NEW IDs every frame! 
        # Source code was:
        #   new_objects[self.next_id] = (cx, cy)
        #   self.next_id += 1
        # This means no temporal consistency. ID 1 in frame 1 is not ID 1 in frame 2.
        # This breaks IdentityCache which relies on track_id.
        # However, I must copy the source logic as requested. 
        # But if it's broken, I should fix it?
        # The user said "use those ... scripts". 
        # But `intrusion detection/app.py` passes `obj_id` to `cache.update`.
        # If `obj_id` changes every frame, cache will never lock.
        # Let's double check key logic in source `tracker.py`.
        
        # Source `tracker.py`:
        # new_objects[self.next_id] = (cx, cy)
        # self.next_id += 1
        # self.objects = new_objects
        # return self.objects
        
        # Yes, it creates new IDs every frame.
        # This implies the Face Rec logic in `app.py` runs every frame on new IDs.
        # Check `app.py`:
        # `last_time = st.session_state.last_recog_time.get(obj_id, 0)`
        # If obj_id is new, last_time is 0.
        # `if now - last_time > 2.0:` -> 0 is always < now, so it runs immediately.
        # `predicted = recognize(face_crop)`
        # `name = cache.update(obj_id, predicted)`
        # `last_recog_time[obj_id] = now`
        
        # Result: It runs face rec EVERY frame for EVERY person.
        # And since ID changes, cache never accumulates votes across frames?
        # Cache `update`: `self.votes[track_id].append(name)`.
        # If track_id changes, votes are for new ID.
        # `if len(votes) >= 1`: It confirms immediately.
        # So it works, but it's inefficient (Face Rec every frame).
        
        # I will implement as is, but maybe add a TODO or comment.
        # Copying source logic exactly.
        
        for (x1, y1, x2, y2) in boxes:
            cx = int((x1+x2)/2)
            cy = int((y1+y2)/2)

            new_objects[self.next_id] = (cx, cy)
            self.next_id += 1

        self.objects = new_objects
        return self.objects
