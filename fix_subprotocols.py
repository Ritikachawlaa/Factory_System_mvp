import sys

filepath = '/home/ubuntu/Factory_System_mvp/backend/main.py'

with open(filepath, 'r') as f:
    text = f.read()

old_accept = """    async def connect(self, websocket: WebSocket):
        await websocket.accept()"""

new_accept = """    async def connect(self, websocket: WebSocket):
        subprotocols = websocket.scope.get('subprotocols', [])
        subprotocol = subprotocols[0] if subprotocols else None
        await websocket.accept(subprotocol=subprotocol)"""

if old_accept in text:
    text = text.replace(old_accept, new_accept)
    with open(filepath, 'w') as f:
        f.write(text)
    print('UPDATED CONNECTION MANAGER')
else:
    print('COULD NOT UPDATE CONNECTION MANAGER')
