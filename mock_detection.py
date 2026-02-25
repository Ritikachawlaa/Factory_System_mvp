import requests
import json

url = "http://54.237.236.148:8000/api/detections/stream"
payload = {
    "camera_id": 1,
    "detections": [
        {"class": "person", "x": 100, "y": 150, "w": 40, "h": 120}
    ]
}
headers = {'Content-Type': 'application/json'}

try:
    response = requests.post(url, json=payload, timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
