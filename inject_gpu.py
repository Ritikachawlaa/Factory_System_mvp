import os
import glob
import re

ml_dir = "/home/ubuntu/Factory_System_mvp/ml"

detector_files = glob.glob(f"{ml_dir}/modules/*/detector.py")
updated_count = 0

for filepath in detector_files:
    with open(filepath, "r") as f:
        content = f.read()

    original_content = content

    if "import torch" not in content:
        content = "import torch\n" + content

    # Add device logic in init if not exists
    if 'torch.device("cuda"' not in content:
        content = re.sub(
            r'(self\.model\s*=\s*YOLO\([^)]+\))', 
            r'\1\n        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")\n        self.model.to(self.device)', 
            content
        )

    # Add optimization to the detect call
    # We look for `def detect(self, frame):` or similar where self.model(frame) is used
    if 'torch.no_grad()' not in content:
        content = re.sub(r'def detect\(self,\s*frame\):', r'def detect(self, frame):\n        self.model.eval()\n        with torch.no_grad():', content)
        
        # indent the rest of the function by 4 spaces. 
        # Actually, simpler: just wrap the specific self.model call.
        
        # Undo the naive function replace
        content = original_content
        if "import torch" not in content:
            content = "import torch\n" + content
            
        content = re.sub(
            r'(self\.model\s*=\s*YOLO\([^)]+\))', 
            r'\1\n        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")\n        self.model.to(self.device)', 
            content
        )

        # Replace `results = self.model(frame...` with eval and no_grad
        # This is very delicate via regex. Because self.model() might be indented differently.
        # Let's just pass the parameters directly to `self.model()` call since ultralytics YOLO handles it:
        # device=self.device, half=True
        
        if 'half=' not in content:
            content = re.sub(
                r'(self\.model\(frame[^)]*)(\))', 
                r'\1, device=self.device, half=True if torch.cuda.is_available() else False\2', 
                content
            )

    if content != original_content:
        with open(filepath, "w") as f:
            f.write(content)
        updated_count += 1
        print(f"Updated {filepath}")

print(f"Total updated: {updated_count}")
