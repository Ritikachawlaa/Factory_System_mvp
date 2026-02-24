import re
import sys

filepath = '/home/ubuntu/Factory_System_mvp/backend/main.py'

with open(filepath, 'r') as f:
    text = f.read()

if 'CORSMiddleware' in text:
    print('CORS ALREADY THERE')
    sys.exit(0)

match = re.search(r'app = FastAPI\([^)]*\)', text)
if not match:
    print('FASTAPI APP NOT FOUND')
    sys.exit(1)

insert_pos = match.end()
cors = """
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
"""
new_text = text[:insert_pos] + cors + text[insert_pos:]

with open(filepath, 'w') as f:
    f.write(new_text)

print('CORS ADDED')
