
import boto3
import logging
import os
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load from backend root if possible
load_dotenv(os.path.join(os.getcwd(), '..', 'backend', '.env'))

logger = logging.getLogger("aws_face_service")

# Configurations
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
COLLECTION_ID = "CamaiFaceCollection"

class AWSFaceService:
    def __init__(self):
        self.enabled = os.getenv("USE_AWS_REKOGNITION", "false").lower() == "true"
        if not self.enabled:
            logger.info("AWS Rekognition is disabled in .env")
            return

        try:
            self.client = boto3.client(
                'rekognition',
                aws_access_key_id=AWS_ACCESS_KEY,
                aws_secret_access_key=AWS_SECRET_KEY,
                region_name=AWS_REGION
            )
            self._ensure_collection()
            logger.info(f"AWS Rekognition initialized in region {AWS_REGION}")
        except Exception as e:
            logger.error(f"Failed to initialize AWS Rekognition: {e}")
            self.enabled = False

    def _ensure_collection(self):
        """Creates the collection if it doesn't exist."""
        try:
            self.client.create_collection(CollectionId=COLLECTION_ID)
            logger.info(f"Created AWS Collection: {COLLECTION_ID}")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceAlreadyExistsException':
                logger.info(f"AWS Collection {COLLECTION_ID} already exists.")
            else:
                raise e

    def index_face(self, image_bytes, external_image_id):
        """Indexes a face into the collection."""
        if not self.enabled: return None
        try:
            response = self.client.index_faces(
                CollectionId=COLLECTION_ID,
                Image={'Bytes': image_bytes},
                ExternalImageId=str(external_image_id),
                MaxFaces=1,
                DetectionAttributes=['ALL']
            )
            face_records = response.get('FaceRecords', [])
            if face_records:
                face_id = face_records[0]['Face']['FaceId']
                logger.info(f"Indexed face for {external_image_id}: {face_id}")
                return face_id
        except Exception as e:
            logger.error(f"Error indexing face to AWS: {e}")
        return None

    def search_face(self, image_bytes, threshold=80):
        """Searches for a face in the collection."""
        if not self.enabled: return None
        try:
            response = self.client.search_faces_by_image(
                CollectionId=COLLECTION_ID,
                Image={'Bytes': image_bytes},
                MaxFaces=1,
                FaceMatchThreshold=threshold
            )
            matches = response.get('FaceMatches', [])
            if matches:
                face = matches[0]['Face']
                confidence = matches[0]['Similarity']
                external_id = face.get('ExternalImageId') # This is our Employee ID
                logger.info(f"AWS Match Found: {external_id} (Similarity: {confidence:.2f}%)")
                return {
                    "external_id": external_id,
                    "confidence": confidence / 100.0
                }
        except Exception as e:
            # ResourceNotFoundException might happen if collection deleted
            # InvalidParameterException if no face found in crop
            logger.debug(f"AWS Search info: {e}")
        return None

# Singleton instance
aws_face_service = AWSFaceService()
