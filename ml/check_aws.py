
import boto3
import os
from dotenv import load_dotenv

# Load from backend root
load_dotenv(os.path.join(os.getcwd(), '..', 'backend', '.env'))

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
COLLECTION_ID = "CamaiFaceCollection"

def check_aws_collection():
    try:
        kwargs = {'region_name': AWS_REGION}
        if AWS_ACCESS_KEY:
            kwargs['aws_access_key_id'] = AWS_ACCESS_KEY
        if AWS_SECRET_KEY:
            kwargs['aws_secret_access_key'] = AWS_SECRET_KEY
            
        client = boto3.client('rekognition', **kwargs)
        
        response = client.describe_collection(CollectionId=COLLECTION_ID)
        face_count = response.get('FaceCount', 0)
        print(f"\n--- AWS Collection Check ---")
        print(f"Collection ID: {COLLECTION_ID}")
        print(f"Faces Indexed: {face_count}")
        
        if face_count > 0:
            print("\nListing first few face IDs:")
            faces = client.list_faces(CollectionId=COLLECTION_ID, MaxResults=10)
            for face in faces.get('Faces', []):
                print(f"- FaceID: {face['FaceId']}, ExternalID: {face.get('ExternalImageId')}")
        else:
            print("\nWARNING: Collection is empty. You need to register an employee to index their face.")
            
    except Exception as e:
        print(f"Error checking AWS Collection: {e}")

if __name__ == "__main__":
    check_aws_collection()
