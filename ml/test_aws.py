
import boto3
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aws_test")

def test_aws():
    try:
        # This will use default credentials (env vars or ~/.aws/credentials)
        client = boto3.client('rekognition')
        response = client.list_collections()
        print("\n--- AWS Rekognition Connection: SUCCESS ---")
        print(f"Existing Collections: {response.get('CollectionIds', [])}")
        return True
    except Exception as e:
        print(f"\n--- AWS Rekognition Connection: FAILED ---")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_aws()
