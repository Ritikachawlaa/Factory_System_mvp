#!/bin/bash

# Configuration
EVIDENCE_DIR="../visitors" # Using visitors dir as proxy for evidence storage in this MVP
BACKUP_DIR="../backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="evidence_backup_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting Evidence Backup..."
if [ -d "$EVIDENCE_DIR" ]; then
    tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$(dirname "$EVIDENCE_DIR")" "$(basename "$EVIDENCE_DIR")"
    echo "✅ Evidence Backup Successful: $BACKUP_DIR/$BACKUP_NAME"
else
    echo "⚠️  Evidence directory not found at $EVIDENCE_DIR"
fi
