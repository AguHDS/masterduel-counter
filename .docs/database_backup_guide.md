# Backup y Restauración de la Base de Datos

Este documento explica cómo funciona el backup automático y cómo **restaurar** la base de datos si algo sale mal.

## Cómo funciona el backup

- **Cuándo:** todos los días a las 3 AM (cron en el VPS).
- **Script:** `/var/www/masterduel-counter/backend/scripts/backup-db.sh`
- **Qué guarda:**
  - **Local (VPS):** los últimos **7** backups en `/var/www/masterduel-counter/backups/`
  - **Remoto (Google Drive):** los últimos **14** backups en `masterduel-counter-backups/` (via rclone)
- **Formato:** `database_YYYYMMDD_HHMMSS.db.gz` (SQLite comprimido con gzip).
- **Log:** `/var/log/db-backup.log`

> El backup usa `sqlite3 .backup`, que crea una copia **consistente** aunque la DB esté en uso (no copia archivos a medias).

---

## Restaurar la base de datos

### Antes de empezar
1. Identificá **desde qué backup** querés restaurar:
   - **Local (más rápido):** `ls -lt /var/www/masterduel-counter/backups/`
   - **Remoto (si el VPS murió):** `rclone lsf gdrive:masterduel-counter-backups`
2. Elegí el archivo con la fecha más cercana al punto que querés recuperar (antes del problema).

### Procedimiento (restaurar desde backup local)

```bash
# 1. Detener el backend para evitar escrituras durante la restauración
pm2 stop masterduel-backend

# 2. Identificar el backup a usar
ls -lt /var/www/masterduel-counter/backups/

# 3. Descomprimir el backup elegido
gunzip /var/www/masterduel-counter/backups/database_20260902_030000.db.gz
# genera database_20260902_030000.db

# 4. (Precaución) respaldar la DB actual por si acaso
cp /var/www/masterduel-counter/backend/prisma/src/data/database.db \
   /var/www/masterduel-counter/backend/prisma/src/data/database.db.pre-restore

# 5. Restaurar la DB
#    El comando .backup copia DESDE el archivo que abrimos HACIA el destino.
#    Por eso abrimos el backup y copiamos hacia la DB viva:
sqlite3 /var/www/masterduel-counter/backups/database_20260902_030000.db \
  ".backup '/var/www/masterduel-counter/backend/prisma/src/data/database.db'"

# 6. Reiniciar el backend
pm2 start masterduel-backend

# 7. Verificar que la app responde
pm2 logs masterduel-backend --lines 30
```

### Procedimiento (restaurar desde Google Drive si el VPS murió o no hay backup local)

```bash
# 1. (Si el VPS sigue vivo) descargar el backup desde Drive
rclone copy "gdrive:masterduel-counter-backups/database_20260902_030000.db.gz" /var/www/masterduel-counter/backups/

# 2. Descomprimir
gunzip /var/www/masterduel-counter/backups/database_20260902_030000.db.gz

# 3. Seguir los pasos 1, 4, 5, 6, 7 del procedimiento anterior
```

---

## Restaurar en un VPS nuevo (recuperación total del droplet)

Si el droplet se destruyó y tenés que levantar todo de cero:

```bash
# 1. Desplegar la app normalmente (deploy de GitHub Actions, o clonar el repo)
cd /var/www/masterduel-counter
git pull origin master

# 2. Instalar rclone y configurarlo (ver BackupPlan.md) para poder bajar el backup

# 3. Descargar el backup más reciente desde Google Drive
rclone copy "gdrive:masterduel-counter-backups" /tmp/backup-restore/
gunzip /tmp/backup-restore/database_*.db.gz

# 4. Copiar la DB restaurada a su lugar
cp /tmp/backup-restore/database_*.db \
   /var/www/masterduel-counter/backend/prisma/src/data/database.db

# 5. Instalar dependencias, migrar y arrancar
cd /var/www/masterduel-counter/backend
npm ci --legacy-peer-deps
npx prisma migrate deploy
npx prisma generate
pm2 restart masterduel-backend || pm2 start npm --name "masterduel-backend" -- start
```

> El código está en GitHub, las imágenes de cartas se re-descargan solas (`npm run download-all-cards`),
> y los datos (usuarios, guías, decks, rankings) están en la DB que restauraste.

---

## Troubleshooting

| Problema | Solución |
|---|---|
| El backup no corre | Revisar `tail -100 /var/log/db-backup.log`. Confirmar que el cron está: `crontab -l`. |
| Error `sqlite3: command not found` | Instalar: `sudo apt-get install -y sqlite3`. |
| Error `rclone: command not found` | Instalar rclone (ver BackupPlan.md, Paso 4). |
| Error de OAuth en rclone | El token expiró o fue revocado. Re-hacer `rclone config` en la PC con browser y volver a copiar `rclone.conf` a la VPS (BackupPlan.md, Pasos 2-3). |
| No aparecen archivos en Google Drive | Verificar el remote y la ruta: `rclone lsd gdrive:` y `rclone lsf gdrive:masterduel-counter-backups`. |
| Quiero más/menos historial | Cambiar `LOCAL_KEEP` y `REMOTE_KEEP` en `backend/scripts/backup-db.sh` (defaults 7 y 14). |

---

## Datos importantes

- **Backup local (VPS):** `/var/www/masterduel-counter/backups/` últimos 7.
- **Backup remoto (Google Drive):** `masterduel-counter-backups/` últimos 14.
- **Log:** `/var/log/db-backup.log`.
- **Script:** `/var/www/masterduel-counter/backend/scripts/backup-db.sh`.
- **Los archivos de backup son sensibles** (contienen datos de usuarios). No los subas a repositorios públicos.