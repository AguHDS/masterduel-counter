### Backend Scripts

`\backend > npm run reset-db` -> Resets database to initial state and cloudinary storage. Run this to create backend\src\data\database.db file if you don't have it. This also DROPS some tables so they are newly created, so run `\backend > npx prisma db push` -> ` \backend > npx prisma generate`.
`\backend > npm run populate-archetypes` -> Populates archetypes from YGOProDeck API to archetypes table
`\backend > npm run cleanup-cards` -> Force clean up temporary cards from the database and cloudinary storage
`\backend > npx prisma studio` -> Opens Prisma Studio to view/edit database content


**Quick tip:**
When editing database Schema or using `reset-db`:
`\backend >  > npx prisma db push` -> `\backend >  > npx prisma generate` -> para tests: `$env:DATABASE_URL="file:./src/data/test.db"; npx prisma db push` -> `$env:DATABASE_URL="file:./src/data/test.db"; npx prisma generate`