import os
import django
import sys

# Setup Django Environment
sys.path.append('/home/ubuntu/Factory_System_mvp/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from customers.models import Client
from services.models import Camera, CameraModule
from django_tenants.utils import schema_context

print("=== All Tenants ===")
for client in Client.objects.all():
    print(f"Tenant: {client.schema_name}")
    with schema_context(client.schema_name):
        cams = Camera.objects.all()
        print(f"  Cameras ({cams.count()}):")
        for c in cams:
            print(f"    - ID: {c.id}, Name: {c.name}, Source: {c.source}")
            mods = CameraModule.objects.filter(camera=c)
            for m in mods:
                print(f"      - Module: {m.module_key}, Status: {m.status}")

print("=== Done ===")
