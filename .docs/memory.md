# Contexto de mi web:
Es un sitio web dedicado a jugadores de yugioh, donde se les permite a los usuarios logeados crear **dos tipos de guías** de arquetipos: Counter Guides (para enseñar cómo counterearlos) y Deck Guides (para enseñar combos y estrategias de juego). Usa la api de https://db.ygoprodeck.com/api/v7 para obtener las cartas y sus imagenes.

# Modelo de guías

Cada usuario logeado puede crear/editar guías de tipo Counter o Deck.
Ambos tipos comparten una base común, pero difieren significativamente en complejidad.
Campos compartidos
title
description
header card
likes, favorites, views,
autor
comentarios

- Counter Guides

Estructura simple orientada a relaciones entre cartas:

Card Pairs
Contenedores donde:
Las cartas superiores representan amenazas
Las cartas inferiores representan counters
NO tienen recommended deck
No tienen lógica de pasos ni representación de juego

- Deck Guides

Estructura más compleja orientada a combos y gameplay:

Initial Hands
Contenedores clickeables con hasta 5 cartas iniciales
Representan posibles manos de inicio
Steps (combo flow)
Cada initial hand tiene una guía paso a paso
Incluye representación visual con cartas
Explica cómo ejecutar el combo
Final Board Preview
Representación del estado final del campo tras ejecutar el combo
Recommended Deck
El creador puede asociar un deck completo a la guía

Flujo tipico de guias:
1. Un usuario puede usar la search principal para buscar un arquetipo (tabs: All, Counter Guides, Deck Guides)
2. Si el arquetipo tiene guías, aparece como registrado. Al seleccionarlo se muestra la lista de guías del tipo seleccionado.
3. Al crear una guía, el usuario elige el tipo mediante un modal (Counter Guide o Deck Guide) antes de entrar al editor. El tipo queda bloqueado y no se puede cambiar después.
4. Ambos tipos de guías comparten: title, description, header card, likes, favorites, views, autor, comentarios.

**Counter Guides:**
- Tienen card pairs (contenedores donde las cartas del bottom son las counter de las de arriba)
- NO tienen recommended deck

**Deck Guides:**
- Tienen initial hands (contenedores con hasta 5 cartas cada uno mostrando manos iniciales)
- Cada initial hand tiene steps(combo flow) y FinalBoardPrewview (representacion de la mesa final)
- SÍ tienen recommended deck

# Pefiles de usuario
Cada usuario tiene un perfil público que muestra su información y sus guías creadas, y otras cosas.

# Stack:
betterauth, better-sqlite3, prisma, cloudinary (para fotos de perfil), react, tanstack query, axios, node y typescript. (leer package.json en /frontend y /backend para mas detalles)

# Arquitectura del monorepo (Puede estar un poco desactualizada, pero el contexto se entiende):
Backend - Hexagonal Architecture:
backend\src\index.ts - punto de entrada del backend
backend\prisma\schema.prisma - prisma schema (guideType: COUNTER/DECK, InitialHand model)
backend\prisma\src\data\database.db - base de datos sqlite
backend\prisma\migrations - migraciones de la base de datos
backend\src\application\services - servicios de negocio (ArchetypeApplicationService, GuideApplicationService, InitialHandApplicationService, etc...)
backend\src\application\ports - interfaces de los servicios de negocio (ArchetypeApplicationPort, GuideApplicationPort, InitialHandApplicationPort, etc...)
backend\src\@types\express\index.d.ts - tipos personalizados para express
backend\src\database\database.ts - configuración de la base de datos
backend\src\domain - entidades del dominio (Archetype, Guide, InitialHand, Card, etc...)
backend\src\domain\ports - interfaces de los repositorios (ArchetypeRepository, GuideRepository, InitialHandRepository, etc...)
backend\src\domain\ports\externalServices - interfaces de servicios externos
backend\src\routes - carpetas con rutas con sus middlewares y controllers
backend\src\http\controllers - controladores de las rutas (aceptan query params ?type=counter|deck)
backend\src\http\middlewares - middlewares de las rutas
backend\src\http\middlewares\legacyUrlRedirectMiddleware.ts - middleware para redirecciones 301 de urls antiguas a nuevas
backend\src\infrastructure\repositories - implementaciones de los repositorios (SqliteArchetypeRepository, SqliteGuideRepository, SqliteInitialHandRepository, etc...)
backend\src\infrastructure\config
backend\src\infrastructure\config\environmentVars.ts - configuración de variables de entorno
backend\src\infrastructure\config\urlHelpers.ts - get base URL based on environment and helpers for redirection 301
backend\src\infrastructure\adapters\externalServices - adaptadores de servicios externos
backend\src\lib\auth.ts - betterauth cfg
backend\src\shared\utils - funciones utilitarias compartidas (paramValidation)
backend\src\shared\dtos - dtos compartidos
backend\src\compositionRoot.ts - composición de dependencias

Frontend - Feature architecture:
frontend\src\App.tsx - punto de entrada del frontend
frontend\src\features - carpetas de features (archetypes, guide-editor, home, etc...). Cada feature tiene carpetas como /api, /components, context, /hooks, /types, etc...
frontend\src\layouts
frontend\src\lib - librerias (axios, tanstack query, etc...). frontend\src\lib\query\queryKeys.ts - query keys para tanstack query
frontend\src\pages - paginas del sitio (HomePage, SignIn, etc...)
frontend\src\shared\components - componentes compartidos (GuidesTable, FeatureErrorBoundary, GuideTypeSelectionModal, etc...)
frontend\src\shared\hooks - hooks compartidos (useDebounce, useAnalyticsPageTracking, etc...)
frontend\src\lib\config\urlHelpers.ts - Get base URL based on environment and also helpers for redirection 301

# Sobre redirect 301 / URL legacy -> SEO-friendly:
- **Archetype guide lists**: Las URLs basadas en ID (`/archetype/42/counter-guides`) son redirigidas a su versión SEO-friendly (`/archetype/abyss-script/counter-guides`) mediante el componente `LegacyArchetypeRedirect` en el frontend (React Router). Detecta si el parámetro es numérico (ID legacy) o no (slug SEO-friendly ya correcto). Si es numérico, fetchea el nombre del archetype via API y hace `<Navigate replace />`. Si no es numérico, simplemente renderiza la página normalmente.
- URLs de guías individuales (author/guide slugs)
- URLs de perfil (user slugs)
Si en el futuro cambiamos otra vez estas URLs, revisar:
- urlHelpers.ts
- App.tsx
- LegacyArchetypeRedirect.tsx
- legacyUrlRedirectMiddleware.ts (backend, solo cubre `/archetype/:id` pelado)

# Resumen de features importantes:
frontend\src\features\archetypes -> feature para cosas reutilizables por otras features que tengan que ver con archetype. CardTooltip.tsx, CardSearchModal.tsx.
frontend\src\features\guide-editor -> feature destinada a la creación y edición de guías. Esta bien organizada separando responsabilidades de las guias tipo DECK y las guias tipo COUNTER.
frontend\src\features\guides-instances -> feature destinada a mostrar una lista de guías de un arquetipo específico filtradas por tipo.
frontend\src\features\home -> CounterGuides.tsx y DeckGuides.tsx muestran últimas guías por tipo, navegación a /archetypes?type=counter|deck
frontend\src\features\registered-archetypes -> lista de arquetipos con al menos 1 guía del tipo seleccionado
frontend\src\features\profile -> perfil de usuario. Refactorizada en junio 2026: componentes separados en ProfileLeftSidebar, ProfileTabBar, ProfileRightSidebar. ProfilePage.tsx es el orquestador (~490 líneas).
frontend\src\features\ranking -> trending mensual y all-time de guías y usuarios. Muestra top 15 guías y top 15 usuarios.
frontend\src\features\guide-request -> usuarios pueden crear solicitudes de guías. Otros usuarios pueden tomarlas y cumplirlas (+1 en Completed Requests stat).
frontend\src\features\tier-list -> tier list de decks meta (Master Duel). Ver `.docs/tierlist.md`.
frontend\src\features\admin-panel -> panel de administracion con tabs: Manage Accounts, Reports, Tracking, Latest Updates, Tier List, Archetypes.

# Features del backend importantes:
- **Guides**: CRUD de guías COUNTER/DECK. Drafts (máx 3 por usuario). Likes/favorites (máx 20 para rol user, ilimitado admin/supporter). Views con cooldown 12h.
- **Auth**: BetterAuth con email/password, Discord, Google OAuth. Register, login, logout, change-username, verify-email.
- **Profile**: Bio (máx 1000 chars), foto de perfil (Cloudinary), favorite card, favorite decks (máx 6 containers), favorited guides.
- **Custom Decks**: Deck builder personal. Máx 10 decks (user), 30 (supporter), ilimitado (admin). Reordenables via drag & drop.
- **Guide Requests**: Usuarios (anónimos o autenticados) crean requests. Otros las toman (7 días para cumplir) y las cumplen linkeando una guía. +1 al stat de Completed Requests del cumplidor.
- **Ranking**: All-time (stats totales) y Trending (stats del mes actual). Snapshots mensuales guardados en MonthlyGuideRanking y MonthlyUserRanking. Score = likes*10 + favs*7 + views*0.1. Requisitos mínimos para trending: guías necesitan 1 like/fav o 50 views; usuarios 1 like/fav o 25 views o 1 request cumplida.
- **Cards**: Búsqueda, selección, confirmación, detalles. Cache local (DB + filesystem) con fallback a YGOProDeck API.
- **Archetypes**: Búsqueda, registro (marcados como registered cuando tienen guías), stats. Admin puede crear/eliminar archetypes (tab Archetypes en admin panel).
- **Tier List**: Scraping de masterduelmeta.com cada 12h. Muestra decks meta en tiers 1/2/3. Linking de entries a archetypes de la DB. Soft-delete + auto-reset. Imagenes resueltas via selectCard (DB local) → YGOProDeck (hotlink fallback). Ver `.docs/tierlist.md`.

# Como funciona nuestro sistema de almacenamiento de imágenes de cartas:

**Objetivo:** Servir imágenes desde VPS local en lugar de hotlinks a YGOProDeck API (reducir latencia de ~300ms a ~50-100ms).

**Dos fuentes de almacenamiento:**

1. **Base de datos SQLite** (`backend/prisma/src/data/database.db`):
   - Cartas que usuarios usaron en guías (~50-500 cartas)
   - Contiene: metadata completa + URLs locales
   - Búsqueda: Ultra rápida (<2ms batch query)

2. **Filesystem** (`backend/uploads/cards/`):
   - Cartas descargadas por script masivo (~14,000 cartas)
   - Contiene: 3 versiones por carta (normal, small, cropped)
   - Búsqueda: Rápida (~15ms verificación paralela)

**Prioridades en búsquedas** (`CardApplicationService.searchCards()`):
1. Consulta YGOProDeck API para nombres de cartas
2. Verifica DB primero (cartas de guías) → si existe, usa URLs locales
3. Verifica filesystem (cartas del script) → si existe, usa URLs locales
4. Fallback a YGOProDeck hotlinks para cartas nuevas/no descargadas

**Script de descarga masiva** (`npm run download-all-cards`):
- Descarga ~14,000 cartas de YGOProDeck a `backend/uploads/cards/`
- Modo resiliente: continúa si alguna imagen falla (tokens sin _cropped.jpg)
- NO guarda en DB, solo archivos físicos
- Ejecutar en VPS antes de producción (detener backend con `pm2 stop all`)
- Flag `--delay <ms>`: delay entre cartas. Default 0ms (local). Usar `--delay 250` en VPS con poca RAM.
- Flag `--limit <n>`: descargar solo N cartas para testing.

**Lazy-loading** (`selectCard()`):
- Cuando usuario selecciona cartas al crear una guia y guarda la guia → descarga imágenes + guarda en DB
- Cartas nuevas se descargan automáticamente on-demand

**Resultado:** ~98-99% de búsquedas usan VPS, 1-2% usan hotlinks (cartas nuevas), latencia reducida 3-5x.

## Hotlinking vs Storage Local

**Filosofia**: Siempre que sea posible, las imagenes de cartas deben servirse desde nuestro storage local (DB + filesystem). El hotlinking directo a YGOProDeck (`https://images.ygoprodeck.com/...`) es un **fallback de ultimo recurso**.

**Orden de prioridad para cualquier feature que necesite imagenes de cartas:**

1. **Buscar en DB local** (`cards` table via `CardRepository`): Si la carta existe en nuestra DB, usar `imageUrlCropped` local. Esto cubre todas las cartas que alguna vez se usaron en guias.
2. **Buscar en filesystem** (`uploads/cards/`): Si la carta no esta en DB pero fue descargada por el script masivo (~14,000 cartas), verificar existencia del archivo y usar URL local.
3. **Hotlink a YGOProDeck**: Solo si la carta no existe localmente ni en DB ni en filesystem, usar la URL externa de YGOProDeck como fallback.

**Nuevas features deben seguir esta prioridad**: DB local → filesystem -> hotlink. No se debe hacer hotlinking directo sin antes verificar nuestro storage.

**Ejemplo - Tier List feature**: `resolveImageForDeck()` busca en DB via `findCardsByArchetype()`, llama a `selectCard()` para garantizar que las imagenes existan en disco, y solo hace hotlink como ultimo recurso.

## Rate limiting

- **Auth** (login/register): 30 req/15min
- **Reports**: 50/h auth, 20/h anon
- **General write** (guides, comments, profile, cards, custom-decks, guide-requests, tier-list): 600/2h auth, 30/h anon
- Solo aplica a POST/PUT/DELETE. GET no se limita (Google, usuarios, todo OK).
- Sliding window: cualquier ventana de X min hacia atrás no puede superar N requests.
- Deshabilitado en modo test (`NODE_ENV=test`).

# Sistema de base de datos (dual layer):

El proyecto usa **dos capas** de acceso a la misma base de datos SQLite:

1. **Prisma** (ORM) - usado por BetterAuth y algunas features (custom decks, ranking snapshots, etc.)
   - Configurado via `DATABASE_URL` en `backend/prisma/schema.prisma`
   - En tests: `.env.test` sobreescribe `DATABASE_URL` para apuntar a `test.db`

2. **better-sqlite3** (queries directas) - usado por la mayoría de repositorios (guías, perfil, etc.)
   - Configurado via `backend/src/database/database.ts` (path hardcodeado)
   - En tests: cuando `NODE_ENV=test`, el constructor automáticamente usa `test.db` en vez de `database.db`

**Ambos apuntan al mismo archivo SQLite** en producción. La separacion es historica: better-auth requiere Prisma, y el resto del proyecto se construyó con better-sqlite3 por velocidad.

# Testing:

## Setup
- **Framework**: Vitest + Supertest (tests de integración HTTP)
- **Base de datos de tests**: `backend/prisma/src/data/test.db` (separada de `database.db`)
- **Configuración**: `backend/.env.test` cargado automáticamente por `backend/src/test-setup.ts`
- **Paralelismo**: `fileParallelism: false` en vitest.config.ts (los tests comparten la misma BD)
- **Rate limiting**: Deshabilitado en modo test
- **Timeout**: 30000ms (aumentado para coverage)

## Estructura
```
backend/src/http/controllers/__tests__/
├── auth.test.ts              # 21 tests - Register, login, logout, change-username, verify-email
├── profile.test.ts           # 15 tests - Search users, get/update profile, bio, favorites, favorited guides
├── cards.test.ts             # 8 tests - Confirm cards, select card, get card details
├── archetypes.test.ts        # 9 tests - With-header, stats, search archetypes
├── custom-decks.test.ts      # 16 tests - CRUD custom decks, max 10/30/unlimited, reorder
├── guide-requests.test.ts    # 25 tests - CRUD requests, take, cancel, fulfill
├── ranking.test.ts           # 13 tests - All-time y trending, filtro mínimo, achievements
└── guides/
    ├── crud.test.ts           # 15 tests - Create COUNTER/DECK, read, update, delete, validation
    ├── interactions.test.ts   # 11 tests - Likes (self-like 403), favorites (max 20), views
    ├── listing.test.ts        # 8 tests - List by archetype, search, latest, user guides
    └── drafts.test.ts         # 11 tests - Save draft (max 3), update, delete, publish from draft
```

**Total**: 152 tests de integración en 11 archivos.

## Cómo ejecutar
```bash
cd backend
npm test              # Ejecutar todos los tests (~90s)
npm run test:watch    # Modo watch
npm run coverage      # Tests + reporte HTML de cobertura en backend/coverage/
npx vitest run src/.../auth.test.ts  # Un archivo específico
```

## Paso inicial (solo una vez)
```bash
cd backend
$env:DATABASE_URL="file:./src/data/test.db"; npx prisma db push
```
Esto crea las tablas en `test.db`. Repetir si cambia el schema de Prisma.

## Filosofia de testing
- **NO testeamos repositorios aislados**: son wrappers finos sobre SQL ya cubiertos por los tests HTTP.
- **NO testeamos BetterAuth**: es librería externa ya testeada por sus autores.
- **NO tenemos E2E (Playwright)**: los tests HTTP cubren toda la lógica de negocio con mayor velocidad y precisión. El setup de E2E fue removido en junio 2026.
- **Testear la capa HTTP indirectamente cubre services y repositorios**: un test de `POST /api/auth/register` ejercita middleware → controller → service → repository → DB.
- **Coverage NO es un objetivo**: 29% global actual, pero las partes con lógica de negocio (controllers, services) tienen alta cobertura. Repos y servicios externos tienen baja cobertura por diseño.

## Datos clave por feature para tests
- **Auth**: Registro requiere CAPTCHA token (bypasseado en tests con `TURNSTILE_SECRET_KEY=` vacío). Login devuelve cookies de sesión → usar `request.agent(app)` para persistirlas.
- **Guías**: Crear guía requiere arquetipo + cards en DB + usuario autenticado. COUNTER necesita `cardPairs`, DECK necesita `initialHands`. Header card es obligatorio.
- **Favorites**: Máximo 20 para rol `user`. Admin/supporter ilimitado. No se puede likear la propia guía (403).
- **Custom Decks**: `mainDeckCards` y `extraDeckCards` se guardan como JSON strings. `displayOrder` para ordenamiento.
- **Ranking**: Trending usa mes actual (live) o snapshots (meses pasados). Requisitos mínimos: guías 1 like/fav o 50 views; usuarios 1 like/fav o 25 views o 1 fulfilled request.
- **Fixture setup**: Crear arquetipos/cards con `prisma.upsert()` en `beforeAll`. Cleanup en `beforeEach` borra en orden (hijos FK primero).

# Sistema de tracking de views en guías:

**Objetivo:** Contar views únicas con cooldown de 12 horas por usuario/guía.

**Implementación:**
- Backend maneja cooldown con cookies (`mdc_viewer_id` UUID) + fingerprinting SHA256
- Tabla `guide_view_tracking` (instanceId + viewerFingerprint) registra última vista
- ViewCountCache acumula views en memoria → flush a DB cada 30 segundos (reduce escrituras)
- Frontend (`useRegisterView`) envía request al backend sin lógica de cooldown local
- Backend responde `{ counted: true/false }` según si view fue contada
- **IMPORTANTE**: Frontend debe usar `axiosClient` (con `withCredentials: true`) para que las cookies funcionen

**Limpieza automática** (`cleanupService.ts`):
- Cron job diario (3 AM) elimina entries >30 días de `guide_view_tracking` usando Prisma
- También limpia notificaciones leídas >1 mes y cuentas no verificadas >24h

**Fix histórico (abril 2026):**
- Sistema fallaba porque `guideInstancesApi.ts` usaba axios directo sin `withCredentials`
- Las cookies NO se enviaban/guardaban → cada visita = usuario nuevo
- Solución: Cambiar todas las llamadas a `axiosClient` configurado con `withCredentials: true`

# Notas técnicas importantes:
- Base de datos: Campo guideType en archetype_instances ('COUNTER' | 'DECK'), tabla initial_hands con JSON array de card IDs
- Rutas frontend: Usan query params (?type=counter|deck) en lugar de rutas separadas
- API: Todos los endpoints aceptan parámetro opcional guideType para filtrado
- Validación backend: COUNTER requiere cardPairs, DECK requiere initialHands (1-5 manos, max 5 cartas cada una)

# Notas a la hora de trabajar:
- No dejar codigo muerto
- No exportar cosas que no se usen fuera
- Correr npm run lint en backend y frontend para ver si hay errores a arreglar
- No hacer unit test de repositorios aislados (backend) (capa HTTP ya los cubre indirectamente)
- No correr tests, los hago yo manualmente.
- No correr comandos tipo npx prisma generate o npx prisma db push, lo hare yo manualmente para evitar crasheos.
- No crear migraciones, ya que soy un unico deb y me manejo con npx prisma db push o npx prisma generate.
- Si agregas nuevos tests de integración, seguí el patrón de los existentes: beforeAll crea fixtures (arquetipos, cards), beforeEach limpia en orden FK-safe, helpers registerAndLogin + createGuide.
- Si un test falla por timeout, revisá que no haya otro test file usando la misma BD simultáneamente (fileParallelism: false).
- Documentación de testing detallada en `.docs/tests-guide.md`.