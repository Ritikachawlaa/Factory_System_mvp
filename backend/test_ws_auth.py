import asyncio
import websockets
import json

async def test_ws_connect():
    # Use a dummy token or a real one if you have it
    # This assumes the server is running on localhost:8000
    uri = "ws://localhost:8000/ws/detections?camera_id=1&token=dummy_token"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")
            await websocket.send("ping")
            response = await websocket.recv()
            print(f"Received: {response}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws_connect())
