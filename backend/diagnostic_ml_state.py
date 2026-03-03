import requests
import json

def diagnostic():
    BASE_URL = "http://localhost:8000"
    
    print(f"--- DIAGNOSTIC: Checking {BASE_URL} ---")
    
    # 1. Check all cameras
    try:
        res = requests.get(f"{BASE_URL}/cameras")
        if res.ok:
            cams = res.json()
            print(f"Found {len(cams)} cameras.")
            for c in cams:
                print(f"Camera {c['id']} ({c['name']}):")
                mods = c.get('modules', [])
                for m in mods:
                    print(f"  - Module: {m['key']}, Status: {m['status']}")
        else:
            print(f"Failed to fetch cameras: {res.status_code}")
    except Exception as e:
        print(f"Error fetching cameras: {e}")

    # 2. Check health of camera 1 (assuming it's the main one)
    try:
        res = requests.get(f"{BASE_URL}/health/system?camera_id=1")
        if res.ok:
            print(f"Health Camera 1: {json.dumps(res.json(), indent=2)}")
        else:
            print(f"Failed to fetch health: {res.status_code}")
    except Exception as e:
        print(f"Error fetching health: {e}")

if __name__ == "__main__":
    diagnostic()
