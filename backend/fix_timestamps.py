import datetime
import os

filepath = r'c:\Users\ritik\Desktop\testing\backend\database.py'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Target for get_db_timestamp
import re

# Match the get_db_timestamp function body regardless of CRLF
pattern1 = re.compile(r'def get_db_timestamp\(\):\s+"""Helper for consistent timestamp formatting\."""\s+return datetime\.datetime\.now\(\)\.strftime\("%Y-%m-%d %H:%M:%S"\)', re.MULTILINE)
new_func = 'def get_db_timestamp():\n    """Helper for consistent timestamp formatting (UTC ISO 8601)."""\n    return datetime.datetime.utcnow().isoformat() + "Z"'

# Match the fromtimestamp conversion regardless of CRLF
pattern2 = re.compile(r'timestamp_dt = datetime\.datetime\.fromtimestamp\(float\(timestamp\)\)\s+timestamp = timestamp_dt\.strftime\("%Y-%m-%d %H:%M:%S"\)', re.MULTILINE)
new_conv = 'timestamp_dt = datetime.datetime.utcfromtimestamp(float(timestamp))\n            timestamp = timestamp_dt.isoformat() + "Z"'

content, count1 = pattern1.subn(new_func, content)
content, count2 = pattern2.subn(new_conv, content)

print(f"Replaced {count1} instance of get_db_timestamp")
print(f"Replaced {count2} instance of timestamp conversion")

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
