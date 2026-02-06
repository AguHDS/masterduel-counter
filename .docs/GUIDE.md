### Backend Scripts

**Go where prisma scheme is located**
`npm run reset-db` -> Resets database to initial state and cloudinary storage. Run this to create backend\src\data\database.db file if you don't have it. This also DROPS some tables so they are newly created, so run `npx prisma db push` -> `npx prisma generate`.
`npm run populate-archetypes` -> Populates archetypes from YGOProDeck API to archetypes table
`npm run cleanup-cards` -> Force clean up temporary cards from the database and cloudinary storage
`npx prisma studio` -> Opens Prisma Studio to view/edit database content

When editing database Schema or using `reset-db`:
`npx prisma db push` -> `npx prisma generate` ->
