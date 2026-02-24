#!/bin/bash
# Set password for camai_user
sudo -u postgres psql -c "ALTER USER camai_user WITH PASSWORD 'camai_pass_2026';"

# Create .env file
cat > /home/ubuntu/Factory_System_mvp/backend/.env << 'EOF'
ENVIRONMENT=production
DATABASE_URL=postgresql://camai_user:camai_pass_2026@localhost:5432/camai_db
SECRET_KEY=camai_production_secret_key_2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=300
VIDEO_SOURCE_DEFAULT=0
EOF

echo ".env created"
cat /home/ubuntu/Factory_System_mvp/backend/.env

# Kill any stale process on port 8000
sudo fuser -k 8000/tcp 2>/dev/null
sleep 1

# Restart backend
sudo systemctl restart backend.service
sleep 3

# Check status
echo "=== STATUS ==="
sudo systemctl is-active backend.service

echo "=== PORT ==="
sudo ss -tlnp | grep 8000

echo "=== HEALTH CHECK ==="
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/docs
echo ""
