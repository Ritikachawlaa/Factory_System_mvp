import shutil
import os

def test_usage():
    total, used, free = shutil.disk_usage("C:")
    print(f"C: Total={total}, Used={used}, Free={free}")
    total, used, free = shutil.disk_usage("/")
    print(f"/ Total={total}, Used={used}, Free={free}")

if __name__ == "__main__":
    test_usage()
