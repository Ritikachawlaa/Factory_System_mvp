import os
import cv2
import numpy as np
from sqlalchemy import create_engine, text
import boto3

db_url = os.environ['DATABASE_URL']
region = os.getenv('AWS_REGION', 'ap-south-1')
collection_id = os.getenv('AWS_REKOGNITION_COLLECTION_ID', 'CamaiFaceCollection')

engine = create_engine(db_url)
conn = engine.connect()
rows = conn.execute(text("SELECT id, photo_path FROM employees WHERE COALESCE(photo_path, '') <> ''")).fetchall()
conn.close()

client = boto3.client(
    'rekognition',
    region_name=region,
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    aws_session_token=os.getenv('AWS_SESSION_TOKEN') or None,
)

ok = 0
skip = 0
fail = 0
for emp_id, photo_path in rows:
    p = (photo_path or '').strip()
    if not p or not os.path.exists(p):
        skip += 1
        continue
    try:
        raw = open(p, 'rb').read()
        arr = np.frombuffer(raw, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            fail += 1
            continue
        ok_jpg, enc = cv2.imencode('.jpg', img, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        if not ok_jpg:
            fail += 1
            continue
        client.index_faces(
            CollectionId=collection_id,
            Image={'Bytes': enc.tobytes()},
            ExternalImageId=str(emp_id),
            MaxFaces=1,
            DetectionAttributes=['ALL']
        )
        ok += 1
    except Exception:
        fail += 1

print(f"reindex_done ok={ok} skip={skip} fail={fail} total={len(rows)}")
