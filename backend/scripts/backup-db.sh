#!/bin/bash
# Daily backup of the db
# Consistent backup using sqlite3 .backup (safe while in use)
# Compressed with gzip
# Local rotation: keeps the last 7 backups
# Uploads to Google Drive (rclone): keep the last 14 backups

set -euo pipefail

# Configuración (rutas del VPS)
DB_PATH="/var/www/masterduel-counter/backend/prisma/src/data/database.db"
BACKUP_DIR="/var/www/masterduel-counter/backups"
# Con el scope drive.file (no sensible), rclone solo ve archivos que él crea.
# Esta carpeta debe ser creada por rclone (rclone mkdir gdrive:masterduel-counter-backups).
# Se puede arrastrar dentro de "Random" en el Drive web después; sigue siendo accesible.
GDRIVE_REMOTE="gdrive:masterduel-counter-backups"

LOCAL_KEEP=7
REMOTE_KEEP=14

DATE="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/database_${DATE}.db"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

mkdir -p "$BACKUP_DIR"

# 1. Backup consistente (SQLite .backup es seguro mientras la DB está en uso)
if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') ERROR: sqlite3 no está instalado" >> /var/log/db-backup.log
  exit 1
fi
sqlite3 "$DB_PATH" ".backup '${BACKUP_FILE}'"

# 2. Comprimir
gzip "$BACKUP_FILE"

# 3. Rotación local: mantener los últimos $LOCAL_KEEP
ls -1t "$BACKUP_DIR"/database_*.db.gz 2>/dev/null \
  | tail -n +$((LOCAL_KEEP + 1)) \
  | xargs -r rm -f

# 4. Subir a Google Drive
if ! command -v rclone >/dev/null 2>&1; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') ERROR: rclone no está instalado" >> /var/log/db-backup.log
  exit 1
fi
rclone copy "$COMPRESSED_FILE" "$GDRIVE_REMOTE" --log-level INFO >> /var/log/db-backup.log 2>&1

# 5. Rotación remota: mantener los últimos $REMOTE_KEEP
# Los nombres (database_YYYYMMDD_HHMMSS.db.gz) ordenan cronológicamente.
rclone lsf "$GDRIVE_REMOTE" --include "database_*.db.gz" \
  | sort -r \
  | tail -n +$((REMOTE_KEEP + 1)) \
  | while read -r f; do
      rclone deletefile "$GDRIVE_REMOTE/$f" >> /var/log/db-backup.log 2>&1
    done

echo "$(date '+%Y-%m-%d %H:%M:%S') Backup OK: ${COMPRESSED_FILE}" >> /var/log/db-backup.log