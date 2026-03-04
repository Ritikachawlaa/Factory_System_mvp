
import os
import sys
import logging

# Add current dir and parent to path for imports
sys.path.append(os.getcwd())
from utils.aws_face_service import AWSFaceService

logging.basicConfig(level=logging.INFO)

def verify():
    print("Testing AWS Face Service Initialization...")
    service = AWSFaceService()
    if service.enabled:
        print("SUCCESS: AWS Face Service initialized and Collection verified.")
        return True
    else:
        print("FAILED: AWS Face Service could not be initialized. Check credentials and region in .env.")
        return False

if __name__ == "__main__":
    verify()
