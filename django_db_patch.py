import os
import django
import sys

# Setup Django Environment
sys.path.append('/home/ubuntu/Factory_System_mvp/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from services.models import Camera, CameraModule

try:
    # Get or create test camera
    cam, created = Camera.objects.get_or_create(
        id=1,
        defaults={
            'name': 'Simulated Camera',
            'source': 'camera1',
            'stream_path': 'camera1'
        }
    )
    if not created:
        cam.name = 'Simulated Camera'
        cam.source = 'camera1'
        cam.stream_path = 'camera1'
        cam.save()

    # Get or create module
    mod, mod_created = CameraModule.objects.get_or_create(
        camera=cam,
        module_key='people_count',
        defaults={
            'status': 'active',
            'config': {}
        }
    )
    if not mod_created:
        mod.status = 'active'
        mod.save()
        
    print("Django Database updated successfully for simulated stream.")
except Exception as e:
    print(f"Failed to update Django database: {e}")
