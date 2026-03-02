import cv2
import numpy as np
import logging
import sys
import os

# Add ml directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from modules.ppe_detection.service import PPEDetectionService
from modules.labour_counting.service import LabourCountingService
from modules.object_abandonment.service import ObjectAbandonmentService
from modules.object_removal.service import ObjectRemovalService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_new_modules")

def test_module(service_class, name):
    logger.info(f"Testing {name}...")
    try:
        service = service_class()
        # Create a dummy frame (640x640)
        frame = np.zeros((640, 640, 3), dtype=np.uint8)
        
        # Process frame
        frame_out, events, boxes = service.process_frame(frame, camera_id=1)
        
        logger.info(f"{name} processed frame successfully.")
        logger.info(f"Events: {len(events)}, Boxes: {len(boxes)}")
        return True
    except Exception as e:
        logger.error(f"{name} failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    results = []
    results.append(test_module(PPEDetectionService, "PPE Detection"))
    results.append(test_module(LabourCountingService, "Labour Counting"))
    results.append(test_module(ObjectAbandonmentService, "Object Abandonment"))
    results.append(test_module(ObjectRemovalService, "Object Removal"))
    
    if all(results):
        logger.info("All modules passed basic verification!")
    else:
        logger.error("Some modules failed verification.")
        sys.exit(1)
