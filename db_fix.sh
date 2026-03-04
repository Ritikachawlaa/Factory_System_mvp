#!/bin/bash
export PGPASSWORD=camai_pass_2026
echo "Updating Camera 16 in PostgreSQL..."
psql -h localhost -U camai_user -d camai_db -c "UPDATE cameras SET stream_path = 'camera1' WHERE id = 16;"
echo "Verification:"
psql -h localhost -U camai_user -d camai_db -c "SELECT id, name, stream_path FROM cameras WHERE id = 16;"
