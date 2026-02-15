class IntrusionDetector:
    def __init__(self, authorized_list):
        self.authorized = set(authorized_list)
        self.alerts = []

    def check_intrusion(self, name):

        if name == "Detecting...":
            return

        if name == "Unknown" or name not in self.authorized:
            msg = "Unauthorized Entry"

            if msg not in self.alerts:
                self.alerts.append(msg)
                return True # Signal that a new alert was added
        return False

    def person_not_detected(self):
        msg = "Person Not Detected"

        if msg not in self.alerts:
            self.alerts.append(msg)
            return True
        return False
        
    def get_alerts(self):
        return self.alerts
    
    def clear_alerts(self):
        self.alerts = []
