
import logging
import os
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

logger = logging.getLogger("aws_face_service")

def _load_env_files():
    """Load env files in a deterministic order without relying on cwd."""
    ml_root = Path(__file__).resolve().parents[1]
    backend_root = ml_root.parent / "backend"

    for env_path in (
        backend_root / ".env",
        backend_root / ".env.prod",
        ml_root / ".env",
    ):
        if env_path.exists():
            load_dotenv(env_path, override=False)

class AWSFaceService:
    def __init__(self):
        _load_env_files()
        self.client = None
        self.enabled = os.getenv("USE_AWS_REKOGNITION", "false").lower() == "true"
        if not self.enabled:
            logger.info("AWS Rekognition is disabled in .env")
            return

        try:
            aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
            aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
            aws_session_token = os.getenv("AWS_SESSION_TOKEN")
            aws_region = os.getenv("AWS_REGION", "ap-south-1")
            self.collection_id = os.getenv("AWS_REKOGNITION_COLLECTION_ID", "CamaiFaceCollection")

            kwargs = {"region_name": aws_region}
            if aws_access_key:
                kwargs["aws_access_key_id"] = aws_access_key
            if aws_secret_key:
                kwargs["aws_secret_access_key"] = aws_secret_key
            if aws_session_token:
                kwargs["aws_session_token"] = aws_session_token

            self.client = boto3.client('rekognition', **kwargs)
            self._ensure_collection()
            logger.info(
                "AWS Rekognition initialized in region %s with collection %s",
                aws_region,
                self.collection_id,
            )
        except Exception as e:
            logger.error(f"Failed to initialize AWS Rekognition: {e}")
            self.enabled = False

    def _ensure_collection(self):
        """Creates the collection if it doesn't exist."""
        try:
            self.client.create_collection(CollectionId=self.collection_id)
            logger.info(f"Created AWS Collection: {self.collection_id}")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceAlreadyExistsException':
                logger.info(f"AWS Collection {self.collection_id} already exists.")
            else:
                raise e

    def index_face(self, image_bytes, external_image_id):
        """Indexes a face into the collection."""
        if not self.enabled: return None
        try:
            response = self.client.index_faces(
                CollectionId=self.collection_id,
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
            threshold = int(os.getenv("AWS_REKOGNITION_MATCH_THRESHOLD", str(threshold)))
            response = self.client.search_faces_by_image(
                CollectionId=self.collection_id,
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
