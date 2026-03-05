"""
Standalone AWS Rekognition service for the Backend.
Used to index employee faces when they are registered.
"""
import os
import logging

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

logger = logging.getLogger("aws_rekognition_backend")

# Load env
load_dotenv(override=False)


class AWSRekognitionService:
    def __init__(self):
        self.client = None
        self.enabled = os.getenv("USE_AWS_REKOGNITION", "false").lower() == "true"
        if not self.enabled:
            logger.info("AWS Rekognition is DISABLED (USE_AWS_REKOGNITION != true)")
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

            self.client = boto3.client("rekognition", **kwargs)
            self._ensure_collection()
            logger.info(
                "AWS Rekognition initialised — region=%s, collection=%s",
                aws_region,
                self.collection_id,
            )
        except Exception as e:
            logger.error(f"Failed to initialise AWS Rekognition: {e}")
            self.enabled = False

    def _ensure_collection(self):
        """Create the face collection if it doesn't exist yet."""
        try:
            self.client.create_collection(CollectionId=self.collection_id)
            logger.info(f"Created AWS collection: {self.collection_id}")
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceAlreadyExistsException":
                logger.info(f"AWS collection already exists: {self.collection_id}")
            else:
                raise

    def index_face(self, image_bytes: bytes, external_image_id) -> str | None:
        """
        Index an employee's face in the AWS Rekognition collection.
        `external_image_id` is the employee's database ID.
        Returns the AWS FaceId or None on failure.
        """
        if not self.enabled:
            return None
        try:
            response = self.client.index_faces(
                CollectionId=self.collection_id,
                Image={"Bytes": image_bytes},
                ExternalImageId=str(external_image_id),
                MaxFaces=1,
                DetectionAttributes=["ALL"],
            )
            face_records = response.get("FaceRecords", [])
            if face_records:
                face_id = face_records[0]["Face"]["FaceId"]
                logger.info(f"Indexed face for employee {external_image_id}: FaceId={face_id}")
                return face_id
            else:
                logger.warning(f"No face detected in image for employee {external_image_id}")
        except Exception as e:
            logger.error(f"Error indexing face to AWS: {e}")
        return None

    def delete_face(self, face_id: str):
        """Delete a face from the collection by FaceId."""
        if not self.enabled:
            return
        try:
            self.client.delete_faces(
                CollectionId=self.collection_id,
                FaceIds=[face_id],
            )
            logger.info(f"Deleted face {face_id} from AWS collection")
        except Exception as e:
            logger.error(f"Error deleting face from AWS: {e}")


# Singleton — created once at import
aws_rekognition = AWSRekognitionService()
