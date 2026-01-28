# Master Duel Counter

This app is meant to help players so they when and why use each handtrap/card agianst different archetypes. In the future we will let users to create their own counter-guides and share them with the community.

#### Preview

Homepage
![Homepage](./assets/showcase/homepage.png)

Archetype counter setup
![Archetype counter setup](./assets/showcase/Archetype-counter.png)

Edit-mode
![Edit-mode](./assets/showcase/Editmode-Archetype.png)

For now, only admins can create archetypes and mark them as registered, but this will change in future updates when we have user system implemented.

### Backend Scripts

`npm run reset-db` -> Resets database to initial state and cloudinary storage. Run this to create backend\src\data\database.db file if you don't have it. This also DROPS some tables so they are newly created, so run `npx prisma db push` -> `npx prisma generate`.
`npm run populate-archetypes` -> Populates archetypes from YGOProDeck API to archetypes table
`npm run cleanup-cards` -> Force clean up temporary cards from the database and cloudinary storage

When editing database Schema or using `reset-db`:
`npx prisma db push` -> `npx prisma generate` -> 


### Stack used
- Frontend: React, Vite, cloudinary react, TailwindCSS, Tanstack/query, Axios
- Backend: Node.js, Express, better-sqlite3, BetterAuth, Prisma, Cloudinary 