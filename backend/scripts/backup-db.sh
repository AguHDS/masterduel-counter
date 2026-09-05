#!/bin/bash
# Daily backup of the db (local VPS and Drive)

set -euo pipefail

DB_PATH="/var/www/masterduel-counter/backend/prisma/src/data/database.db"
BACKUP_DIR="/var/www/masterduel-counter/backups"
GDRIVE_REMOTE="gdrive:masterduel-counter-backups"

LOCAL_KEEP=7
REMOTE_KEEP=14

DATE="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/database_${DATE}.db"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

mkdir -p "$BACKUP_DIR"

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') ERROR: sqlite3 no está instalado" >> /var/log/db-backup.log
  exit 1
fi
sqlite3 "$DB_PATH" ".backup '${BACKUP_FILE}'"

gzip "$BACKUP_FILE"

ls -1t "$BACKUP_DIR"/database_*.db.gz 2>/dev/null \
  | tail -n +$((LOCAL_KEEP + 1)) \
  | xargs -r rm -f

# Upload to Google Drive using rclone
if ! command -v rclone >/dev/null 2>&1; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') ERROR: rclone no está instalado" >> /var/log/db-backup.log
  exit 1
fi
rclone copy "$COMPRESSED_FILE" "$GDRIVE_REMOTE" --log-level INFO >> /var/log/db-backup.log 2>&1

rclone lsf "$GDRIVE_REMOTE" --include "database_*.db.gz" \
  | sort -r \
  | tail -n +$((REMOTE_KEEP + 1)) \
  | while read -r f; do
      rclone deletefile "$GDRIVE_REMOTE/$f" >> /var/log/db-backup.log 2>&1
    done

echo "$(date '+%Y-%m-%d %H:%M:%S') Backup OK: ${COMPRESSED_FILE}" >> /var/log/db-backup.log