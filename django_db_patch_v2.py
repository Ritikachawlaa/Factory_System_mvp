import os
import django
import sys

# Setup Django Environment
sys.path.append('/home/ubuntu/Factory_System_mvp/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from customers.models import Client
from services.models import Camera, CameraModule

try:
    # Get the default client/tenant
    client = Client.objects.filter(schema_name='public').first()
    if not client:
        client = Client.objects.first()

    if not client:
        print("Error: No Client/Tenant found in the database. Cannot create a camera.")
        sys.exit(1)

    print(f"Using Client: {client.name} ({client.schema_name})")

    # The backend architecture uses django-tenants.
    # We must operate inside the tenant schema context.
    from django_tenants.utils import schema_context
    
    with schema_context(client.schema_name):
        cam, created = Camera.objects.get_or_create(
            name='Simulated Camera',
            defaults={
                'source': 'camera1',
                'stream_path': 'camera1',
            }
        )
        if not created:
            cam.source = 'camera1'
            cam.stream_path = 'camera1'
            cam.save()

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
            
        print(f"Created/Updated Camera ID: {cam.id} in schema {client.schema_name}")

except Exception as e:
    import traceback
    print(f"Failed to update Django database: {e}")
    traceback.print_exc()
