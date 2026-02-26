import urllib.request
import json

try:
    with urllib.request.urlopen('http://127.0.0.1:8000/cameras') as response:
        data = json.loads(response.read().decode())
        print("Cameras API Response:")
        print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error fetching cameras: {e}")
