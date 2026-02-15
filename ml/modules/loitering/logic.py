import time

class CrowdLoitering:

    def __init__(self):
        self.timer_start = None
        self.alert_active = False

    def update(self, person_count, threshold, time_limit):

        # Start timer
        if person_count >= threshold:

            if self.timer_start is None:
                self.timer_start = time.time()

            elapsed = time.time() - self.timer_start

            if elapsed >= time_limit:
                self.alert_active = True
                return True, elapsed

        else:
            # Reset if crowd breaks
            self.timer_start = None
            self.alert_active = False

        return False, 0
