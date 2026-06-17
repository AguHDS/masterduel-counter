# Tier List Feature

## Overview

Feature que muestra una tier list de decks meta del momento para Yu-Gi-Oh! Master Duel. Los datos se obtienen mediante scraping de `masterduelmeta.com/tier-list` y pueden ser editados manualmente por un admin.

## Cómo funciona

### Scraping

Un cron job (cada 12h) ejecuta `MasterDuelMetaScraper`. El scraper y la persistencia siguen estas reglas:

**Scraper merge (`replaceScrapedEntries`):**

| Source | Sin link | Con link (`linkedArchetypeId`) |
|--------|---------|-------------------------------|
| Scraped | Tier sigue al meta. Imagen NUNCA se pisa. | Tier siempre sigue al meta. Link + imagen nunca se tocan. |
| Manual | Tier e imagen **congelados**. | Tier siempre sigue al meta. Link + imagen nunca se tocan. |
| Inactiva (`is_active=0`, admin la borró) | **Skipped**. No se re-inserta. Se reactiva si el deck sale del meta. | Igual. |

**Auto-reset**: Si una entry fue soft-deleteada por admin y el deck NO aparece en el nuevo scrape, se reactiva (`is_active=1`). Cuando el deck vuelva al meta, reaparece automaticamente.

**Fallen**: Entradas activas (scraped o manual) cuyo deck no aparece en el scrape → DELETE.

El admin puede:
- **Prender/apagar** el scraping desde el admin panel (toggle `scrapingEnabled`)
- **Disparar scrape manual** con boton "Scrape Now"
- **Editar** nombre, tier, imagen, source de cualquier entry
- **Linkear** una entry a un archetype de la DB via el boton "Link" (corrige nombres inconsistentes)
- **Agregar/eliminar** entries manualmente

### Resolucion de imagenes

Cuando se scrapea un nuevo deck, el `resolveImageForDeck` intenta obtener una imagen:

1. **DB local primero** (`CardRepository.findCardsByArchetype`): busca cartas en nuestra DB con `archetype LIKE %nombre%` → usa `imageUrlCropped` local (servida desde nuestro storage, sin hotlinking)
2. **Fallback a YGOProDeck API**: usa el adapter `searchCardByNameFromExternalApi` con `fname=` → obtiene `image_url_cropped` como hotlink externo
3. **Admin manual**: si todo falla, el admin puede seleccionar una imagen via `FloatingCardSearchModal`

Esto respeta el sistema de storage del proyecto: prioriza URLs locales (DB + filesystem) antes de hacer hotlinking a YGOProDeck.

### Resolucion de imagenes con selectCard()

Cuando se resuelve una imagen para un deck, se usa `CardApplicationService.selectCard()` que:
1. Verifica si la carta existe en DB con imagenes locales
2. Si las imagenes no existen en disco, las descarga de YGOProDeck
3. Retorna `imageUrlCropped` con URL local garantizada
4. Si `selectCard()` falla → fallback a YGOProDeck hotlink

## Data Model

```
TierListEntry:
  id, deckName, tier (1|2|3), format ("masterduel"), position, imageUrl?
  source ("scraped"|"manual"), isActive, linkedArchetypeId?, linkedArchetypeName?
  counterGuideCount, deckGuideCount
  scrapedAt?, createdAt, updatedAt

TierListConfig:
  id, format (unique), scrapingEnabled (default: true), lastScrapedAt?, updatedAt
```

## API Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/tier-list | Obtener tier list publica |
| GET | /api/tier-list/config | Admin: ver config |
| PUT | /api/tier-list/config | Admin: toggle scraping |
| POST | /api/tier-list/scrape | Admin: disparar scrape manual |
| POST | /api/tier-list/save | Admin: guardar cambios (bulk) |
| PUT | /api/tier-list/entries/reorder | Admin: reordenar |

## Frontend

### Ruta publica: `/tierlist` → `TierListPage`

Diseno inspirado en prydwen.gg/star-rail/tier-list:
- Tiers apilados en un contenedor unico con `rounded-xl`
- Label lateral (T1/T2/T3) en columna izquierda con gradiente del color del tier
- Grid de cards a la derecha (responsive: 2→3→4→5 columnas)
- Cada `TierCard`: imagen de fondo con overlay frosted glass + nombre del deck + conteo de guias (Counter en rojo, Deck en cian). Fondo sutil con color del tier.
- Muestra `linkedArchetypeName` si tiene link, sino `deckName`.
- Click → si tiene `linkedArchetypeId` navega a `/archetype/{id}/counter-guides`, sino navega por slug.

Colores por tier: T1 (amber/gold), T2 (slate/silver), T3 (orange/bronze)

### Navbar

Link "Tier List" como primer item (antes de CARDS), icono `Swords`, mismo estilo gold.

### Admin tab

Replica exacta visual de la pagina publica, con:
- Badge de source en cada card ("scraped"/"manual") - solo visible aca
- Cards editables (nombre, tier, source, imagen via `FloatingCardSearchModal`)
- Boton "+" para agregar decks manuales, boton "X" para eliminar
- Boton "🔗 Link" en cada card para asociar a un archetype de nuestra DB (corrige nombres inconsistentes como HEROs → HERO)
- Source toggle (Scraped/Manual): Manual congela tier + imagen. Scraped sigue al meta pero mantiene imagen custom.
- Save bar fija abajo: "Save Changes" → `POST /api/tier-list/save` (soft-delete para entradas removidas)

## Linking de archetypes

Los nombres de decks en MasterDuelMeta pueden diferir de los archetypes en nuestra DB (ej: HEROs vs HERO, Gem-Knight no existe). Para resolverlo:

- **Admin**: clickea el boton "Link" en una card → busca y selecciona un archetype de nuestra DB
- **Efecto**: `linkedArchetypeId` + `linkedArchetypeName` se guardan. TierCard publico muestra el nombre linkeado y navega al archetype correcto.
- **Scraper**: las entradas linkeadas siempre siguen al meta (tier se actualiza), sin importar source. Link + imagen nunca se tocan.
- **Unlink**: boton "Remove link" en el modal para desvincular.

## Soft-delete y auto-reset

- **Soft-delete**: Al borrar una entry en admin (boton "X" + save), se marca `is_active=0` en vez de DELETE hard.
- **Auto-reset**: Si el deck sale del meta (no aparece en el scrape), la entry inactiva se reactiva automaticamente. Cuando el deck vuelva al meta meses despues, reaparece sin intervencion.
- **Respeto**: Si el deck SIGUE en el meta pero el admin lo borro, se respeta el soft-delete (no se re-inserta).

## Admin Archetypes Tab

Nueva tab en Admin Panel para gestionar archetypes de la DB:

- **Listar/Search**: Muestra todos los archetypes con busqueda.
- **Agregar**: Crea un archetype custom (ej: Gem-Knight). Funciona en MainSearch y permite crear guias.
- **Eliminar**: Borra archetype si no tiene guias asociadas.
- API: `GET/POST /api/admin/archetypes`, `DELETE /api/admin/archetypes/:id`

## Stack

- **Scraping**: `MasterDuelMetaScraper` (HTML parsing via `<hr>` separators + fallback `tier-img-container`)
- **Imagenes**: `resolveImageForDeck` → `findCardsByArchetype` (DB local) → `selectCard` (descarga + storage) → YGOProDeck hotlink (ultimo recurso)
- **DB**: better-sqlite3 via `SqliteTierListRepository`
- **Cron**: `setInterval` cada 12h en `tierListScraperService.ts`. En desarrollo, auto-scrapea 10s post-startup.
- **Frontend**: `FloatingCardSearchModal` para seleccion de imagenes en admin. `confirmCards()` al seleccionar para guardar en storage.
- **Guide counts**: `enrichWithGuideCounts` hace batch query de `archetype_instances` agrupada por `archetype_id` + `guide_type`. Usa `linkedArchetypeId` cuando existe, o matchea por `deckName` en `archetypes`.

## Flujo verificado de scraping

```
Backend inicia
  └─ 10s después (dev): tierListScraperService auto-scrape
       └─ MasterDuelMetaScraper.scrapeTierList()
            ├─ fetch HTML de masterduelmeta.com
            ├─ parsear <hr> separadores → fallback tier-img-container si falla
            ├─ extraer deck names + tiers
            └─ resolveImageForDeck() para cada deck sin imagen
                 ├─ findCardsByArchetype() en DB
                 │   ├─ encontrado → selectCard() → URL local ✅
                 │   └─ no encontrado → YGOProDeck API → selectCard() → URL local ✅
                 └─ fallback final: hotlink YGOProDeck

F5 en /tierlist
  └─ GET /api/tier-list (SOLO LECTURA, no scrape)
       └─ frontend: useQuery con staleTime 5min

Click "Scrape Now" (admin)
  └─ POST /api/tier-list/scrape → mismo flujo que el cron
       └─ onSuccess: invalidateQueries → refetch automatico de datos
```

## URLs en produccion

- `cardImageStorageService.getApiImageUrl()` usa `process.env.BACKEND_URL`
- En local: `http://localhost:3001/api/uploads/cards/{id}_cropped.jpg`
- En VPS: seteando `BACKEND_URL=https://masterduelcounter.com` en `.env` → URLs con dominio real
- Si se copia la DB local al VPS, las URLs `localhost` se regeneran en el primer scrape automatico

## Progreso

- [x] Planificacion y diseno
- [x] Modelo de datos (Prisma)
- [x] Backend: Domain + Application + Infrastructure
- [x] Backend: Controllers + Routes
- [x] Backend: Scraper (<hr>-based parsing)
- [x] Backend: Image resolver (selectCard + DB-first + YGOProDeck fallback)
- [x] Backend: Manual entries sync (imagen protegida, tier sigue meta)
- [x] Backend: Cron job 12h + DI wiring
- [x] Frontend: Types + API + Hooks
- [x] Frontend: TierCard + TierSection + TierListPage (prydwen-style)
- [x] Frontend: Admin tab + FloatingCardSearchModal + source toggle
- [x] Frontend: Navbar + App routing + AdminPanel integration
- [x] UI responsive (2→3→4→5 columnas)
- [x] Sin referencias a power en todo el codigo
- [x] download-all-cards con flag --delay
- [x] Imagenes locales via selectCard + confirmCards
- [x] Linking de archetypes (linkedArchetypeId/Name)
- [x] Soft-delete + auto-reset de entradas borradas
- [x] Admin Archetypes Tab (CRUD de archetypes en DB)
- [x] `npx prisma db push` (manual)
- [ ] Deploy y pruebas
