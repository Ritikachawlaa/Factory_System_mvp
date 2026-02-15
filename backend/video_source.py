import cv2
import time
import threading
import numpy as np

class VideoSource:
    """
    Abstract Base Class for Video Sources (Webcam, RTSP, File).
    """
    def __init__(self, source_id, config=None):
        self.source_id = source_id
        self.config = config or {}
        self.status = False
        self.frame = None
        self.is_running = False

    def start(self):
        raise NotImplementedError

    def stop(self):
        raise NotImplementedError

    def get_frame(self):
        """Returns (status, frame)"""
        return self.status, self.frame

class WebcamSource(VideoSource):
    """
    Implementation for local webcams using OpenCV VideoCapture.
    Includes threading for non-blocking reads.
    """
    def __init__(self, source_id, width=640, height=480):
        super().__init__(source_id)
        # Normalize source ID (int for webcam index, str for file path if needed)
        try:
            self.src = int(source_id)
        except ValueError:
            self.src = source_id
            
        self.width = width
        self.height = height
        self.thread = None
        self.capture = None

    def start(self):
        if self.is_running:
            return

        print(f"[VideoSource] Starting WebcamSource({self.src})...")
        self.capture = cv2.VideoCapture(self.src)
        self.capture.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self.capture.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
        self.capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        self.is_running = True
        self.thread = threading.Thread(target=self._update, daemon=True)
        self.thread.start()

    def stop(self):
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=1.0)
        
        if self.capture and self.capture.isOpened():
            self.capture.release()
        print(f"[VideoSource] Stopped WebcamSource({self.src})")

    def _update(self):
        while self.is_running:
            if self.capture.isOpened():
                (status, frame) = self.capture.read()
                if status:
                    self.status = True
                    self.frame = frame
                else:
                    self.status = False
            else:
                self.status = False
                time.sleep(0.1)
            
            time.sleep(0.005) # Cap loop rate slightly

class RTSPSource(VideoSource):
    """
    Stub for future RTSP support.
    """
    def start(self):
        print(f"[VideoSource] RTSP Source {self.source_id} not implemented yet.")
        self.is_running = True
        
    def stop(self):
        self.is_running = False

    def get_frame(self):
        # Return a blank/placeholder frame
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(img, "RTSP NOT IMPL", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        return True, img
