# Tier List Feature

## Overview

Feature que muestra una tier list de decks meta del momento para Yu-Gi-Oh! Master Duel. Los datos se obtienen mediante scraping de `masterduelmeta.com/tier-list` y pueden ser editados manualmente por un admin.

## Cómo funciona

### Scraping

Un cron job (cada 12h) ejecuta `MasterDuelMetaScraper` que:
1. Fetch HTML de `https://www.masterduelmeta.com/tier-list#power-rankings`
2. Parsea las secciones de tier usando `<hr>` tags como separadores entre tier 1/2/3
3. Extrae nombres de decks de los links `/tier-list/deck-types/...`
4. Reemplaza entries con `source="scraped"` en la DB
5. Sincroniza el tier de entries con `source="manual"` (solo protege la imagen, el tier sigue al meta)
6. Elimina entries manuales que desaparecieron del meta

El admin puede:
- **Prender/apagar** el scraping desde el admin panel (toggle `scrapingEnabled` en `TierListConfig`)
- **Disparar scrape manual** con un boton "Scrape Now"
- **Editar manualmente** cualquier entry (nombre, tier, imagen, source)
- **Cambiar source** a "manual" para proteger entries de ser sobrescritas por futuros scrapes
- **Seleccionar imagen** via `FloatingCardSearchModal` (mismo modal que el editor de guias)

### Resolucion de imagenes

Cuando se scrapea un nuevo deck, el `resolveImageForDeck` intenta obtener una imagen:

1. **DB local primero** (`CardRepository.findCardsByArchetype`): busca cartas en nuestra DB con `archetype LIKE %nombre%` → usa `imageUrlCropped` local (servida desde nuestro storage, sin hotlinking)
2. **Fallback a YGOProDeck API**: usa el adapter `searchCardByNameFromExternalApi` con `fname=` → obtiene `image_url_cropped` como hotlink externo
3. **Admin manual**: si todo falla, el admin puede seleccionar una imagen via `FloatingCardSearchModal`

Esto respeta el sistema de storage del proyecto: prioriza URLs locales (DB + filesystem) antes de hacer hotlinking a YGOProDeck.

### Persistencia de imagenes

- Entries con `source="manual"`: **Solo la imagen esta protegida**. El tier y la existencia siguen al scraper automaticamente. Si el deck sube/baja de tier, la entry manual tambien. Si desaparece del meta, se elimina.
- Entries con `source="scraped"`: Todo se reemplaza en cada scrape (imagen, tier, posicion).
- El admin puede cambiar `source` desde el admin panel (dropdown Scraped/Manual).
- Al seleccionar una imagen via `FloatingCardSearchModal`, se llama a `POST /api/cards/confirm` para guardar la carta en nuestro storage (mismo flujo que las guias).

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
  source ("scraped"|"manual"), isActive, scrapedAt?, createdAt, updatedAt

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
- Cada `TierCard`: imagen de fondo con overlay frosted glass + nombre del deck
- Click → navega a `/archetype/:slug/counter-guides`

Colores por tier: T1 (amber/gold), T2 (slate/silver), T3 (orange/bronze)

### Navbar

Link "Tier List" como primer item (antes de CARDS), icono `Swords`, mismo estilo gold.

### Admin tab

Replica exacta visual de la pagina publica, con:
- Badge de source en cada card ("scraped"/"manual") - solo visible aca
- Cards editables (nombre, tier, source, imagen via `FloatingCardSearchModal`)
- Boton "+" para agregar decks manuales, boton "X" para eliminar
- Boton "Scrape Now" + toggle de scraping
- Save bar fija abajo: "Save Changes" → `POST /api/tier-list/save`

## Stack

- **Scraping**: `MasterDuelMetaScraper` (HTML parsing via `<hr>` separators + fallback `tier-img-container`)
- **Imagenes**: `resolveImageForDeck` → `findCardsByArchetype` (DB local) → `selectCard` (descarga + storage) → YGOProDeck hotlink (ultimo recurso)
- **DB**: better-sqlite3 via `SqliteTierListRepository`
- **Cron**: `setInterval` cada 12h en `tierListScraperService.ts`. En desarrollo, auto-scrapea 10s post-startup.
- **Frontend**: `FloatingCardSearchModal` para seleccion de imagenes en admin. `confirmCards()` al seleccionar para guardar en storage.

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
- [x] `npx prisma db push` (manual)
- [ ] Deploy y pruebas
