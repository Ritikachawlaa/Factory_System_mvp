import cv2
import numpy as np

class HeatmapEngine:
    def __init__(self, frame_width=640, frame_height=480):
        self.width = frame_width
        self.height = frame_height
        self.heatmap = np.zeros((self.height, self.width), dtype=np.float32)

    def update_bbox(self, boxes, intensity=0.3):
        for (x1, y1, x2, y2) in boxes:
            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(self.width, x2)
            y2 = min(self.height, y2)
            self.heatmap[y1:y2, x1:x2] += intensity

    def render(self, blur_kernel=(51, 51)):
        heatmap_blur = cv2.GaussianBlur(self.heatmap, blur_kernel, 0)
        heatmap_norm = cv2.normalize(heatmap_blur, None, 0, 255, cv2.NORM_MINMAX)
        heatmap_uint8 = heatmap_norm.astype(np.uint8)
        heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        return heatmap_color

    def reset(self):
        self.heatmap[:] = 0
