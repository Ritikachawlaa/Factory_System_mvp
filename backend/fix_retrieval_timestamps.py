import re
import os

filepath = r'c:\Users\ritik\Desktop\testing\backend\database.py'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to replace "timestamp": str(r[0]) with ISO format + Z
# Also handles different variable names like e["timestamp"] etc.
# But mostly it's "timestamp": str(r[0]) or similar in dict comprehensions/loops

# Replace common "timestamp": str(r[0]) pattern
# We want to use a helper or just inline the logic: 
# (r[0].isoformat() + "Z" if hasattr(r[0], "isoformat") else str(r[0]))

patterns = [
    (r'"timestamp": str\(r\[0\]\)', r'"timestamp": (r[0].isoformat() + "Z" if hasattr(r[0], "isoformat") else str(r[0]))'),
    (r'"timestamp": str\(e\["timestamp"\]\)', r'"timestamp": (e["timestamp"].isoformat() + "Z" if hasattr(e["timestamp"], "isoformat") else str(e["timestamp"]))'),
    (r'"timestamp": str\(r\[1\]\)', r'"timestamp": (r[1].isoformat() + "Z" if hasattr(r[1], "isoformat") else str(r[1]))'), # For cases where timestamp is second col
]

for p, r_val in patterns:
    content, count = re.subn(p, r_val, content)
    print(f"Replaced {count} instances of {p}")

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
