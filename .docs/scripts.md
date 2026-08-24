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
