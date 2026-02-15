#!/bin/bash

# Production Startup Script
# Usage: ./run_prod.sh

# Ensure venv is active (if applicable)
# source ../venv/bin/activate

# Configuration
HOST="0.0.0.0"
PORT="8000"
WORKERS=4

echo "🚀 Starting Production Server (Gunicorn + Uvicorn)..."
echo "Host: $HOST:$PORT | Workers: $WORKERS"

exec gunicorn main:app \
    --workers $WORKERS \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind $HOST:$PORT \
    --access-logfile access.log \
    --error-logfile error.log \
    --log-level info
