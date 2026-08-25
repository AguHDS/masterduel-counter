### Backend Scripts

`\backend > npm run reset-db` -> Resets database to initial state and cloudinary storage. Run this to create backend\src\data\database.db file if you don't have it. This also DROPS some tables so they are newly created, so run `\backend > npx prisma db push` -> ` \backend > npx prisma generate`.
`\backend > npm run cleanup-cards` -> Force clean up temporary cards from the database and cloudinary storage
`\backend > npx prisma studio` -> Opens Prisma Studio to view/edit database content


**Quick tip:**
When editing database Schema or using `reset-db`:
`\backend >  > npx prisma db push` -> `\backend >  > npx prisma generate` -> para tests: `$env:DATABASE_URL="file:./src/data/test.db"; npx prisma db push` -> `$env:DATABASE_URL="file:./src/data/test.db"; npx prisma generate`

# Imagenes y arquetipos

`\backend > npm run populate-archetypes` -> Populates archetypes from YGOProDeck API to archetypes table

---

## Descargar imagenes de cartas (Opcional)
# Descarga ~14,000 imagenes de YGOProDeck al filesystem (uploads/cards/)
# Sin delay (local PC): npm run download-all-cards
# Con delay 250ms (VPS con poca RAM): usar --delay 250
# Con limite para testear: --limit 100
cd /var/www/masterduel-counter/backend
pm2 stop masterduel-backend
npm run download-all-cards -- --delay 250
pm2 start masterduel-backend
# Tiempo estimado sin delay: ~30-60 min (depende de internet)
# Tiempo estimado con delay 250ms: ~3-4 horas
# Importante: Este comando solo guarda archivos en disco (uploads/cards/).
# No guarda metadata en la tabla "cards" de la DB.
# Las cartas se agregan a la DB automaticamente cuando un usuario
# las usa en una guia (via selectCard/confirmCards).


## Thumbnails optimizados (Opcional)
# Pre-generar cache de thumbnails para todas las cartas (10-20 min)
cd /var/www/masterduel-counter/backend
pm2 stop masterduel-backend
npm run generate-thumbnails:prod
pm2 start masterduel-backend
# Nota: Los thumbnails se generan automaticamente on-demand si no se pre-generan

---

## Server Management (Admin Panel)

Todos los scripts de mantenimiento se pueden ejecutar desde el Admin Panel -> **Server Management** sin entrar al VPS:

Botones y scripts disponibles

- Download Card Images
  Ejecuta `download-all-cards` -> en producción usar `--delay 250` para no sobrecargar el servidor; `--limit` es opcional y solo para pruebas.
  → Mantenimiento automático: Sí

- Populate Archetypes
  Ejecuta `populate-archetypes` -> llena la base de datos con los arquetipos disponibles.
  →->Mantenimiento automático: No

- Generate Thumbnails
  Ejecuta `generate-thumbnails` -> crea las versiones en miniatura de las imágenes.
  -> Mantenimiento automático: Sí

- Update Card Details
  Ejecuta `update-card-details` -> actualiza la información de cada carta (texto, atributos, etc.).
  -> Mantenimiento automático: Sí

- Migrate Card Images
  Ejecuta `migrate-card-images` -> mueve las imágenes de una ubicación a otra si es necesario.
  -> Mantenimiento automático: Sí

- Restart Server
  Ejecuta `pm2 restart masterduel-backend` -> solo disponible en producción, para reiniciar el servicio.
  → Mantenimiento automático: —

El backend lanza cada script como child process detached, redirige stdout/stderr a `backend/data/task-logs/<id>.log`, y el estado (tarea activa + maintenance flag) se persiste en `backend/data/server-state.json`. Las tareas pesadas activan el modo mantenimiento (los usuarios ven "come back soon") y se apaga solo al terminar. `GET /api/status` expone el flag para el frontend.
