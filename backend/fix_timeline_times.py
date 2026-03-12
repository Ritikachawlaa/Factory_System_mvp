import re
import os

filepath = r'c:\Users\ritik\Desktop\testing\backend\database.py'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to replace the manual split(' ')[1] logic
# Original: "time": e["timestamp"].split(' ')[1] if ' ' in e["timestamp"] else e["timestamp"]
# We want just e["timestamp"] (which is now ISO) and let the frontend handle the "time" part
# OR we do some logic in backend. 
# Better: just return e["timestamp"] and let frontend do .toLocaleTimeString()

patterns = [
    (r'"time": e\["timestamp"\]\.split\(\' \'\)\[1\] if \' \' in e\["timestamp"\] else e\["timestamp"\]', r'"time": e["timestamp"]'),
]

for p, r_val in patterns:
    content, count = re.subn(p, r_val, content)
    print(f"Replaced {count} instances of {p}")

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
