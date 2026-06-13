# Testing Guide

Este documento explica el setup de testing del proyecto, como funciona el aislamiento de base de datos, como ejecutar los tests, y las convenciones a seguir.

---

## Tipos de Tests

El proyecto tiene 2 niveles de testing (E2E no implementado, ver seccion de Filosofia):

| Nivel | Herramienta | Ubicacion | Que prueba |
|---|---|---|---|
| **Backend Integration** | Vitest + Supertest | `backend/src/**/__tests__/` | Logica de negocio, repositorios con BD de prueba, endpoints HTTP. |
| **Frontend Unit/Component** | Vitest + Testing Library | `frontend/src/**/__tests__/` | Hooks con logica de estado/mutaciones, componentes interactivos complejos, utilidades puras. |

---

## Estructura de Directorios

```
raiz/
├── backend/
│   ├── .env                            # Produccion/dev (NO se commitea, tiene secrets)
│   ├── .env.test                       # Tests (SI se commitea, solo tiene DATABASE_URL)
│   ├── vitest.config.ts                # Config de vitest para backend
│   └── src/
│       ├── test-setup.ts               # Carga .env.test al iniciar los tests
│       ├── application/services/
│       │   └── __tests__/              # Unit tests de application services
│       ├── infrastructure/repositories/
│       │   └── __tests__/              # Integration tests de repositorios
│       └── http/controllers/
│           └── __tests__/              # API endpoint tests (supertest)
│
└── frontend/
    ├── vitest.config.ts                # Config de vitest para frontend
    └── src/
        ├── test-setup.ts               # Setup global (jest-dom matchers)
        └── features/
            └── profile/
                ├── hooks/
                │   └── __tests__/      # Tests de hooks (useProfileEditor, etc.)
                └── components/
                    └── __tests__/      # Tests de componentes (ProfileLeftSidebar, etc.)
```

---

## Como Ejecutar los Tests

### Backend Tests (Vitest)

```bash
cd backend

# Ejecutar todos los tests (sin watch)
npm test

# Modo watch (re-ejecuta al guardar)
npm run test:watch

# Un archivo especifico
npx vitest run src/http/controllers/__tests__/auth.test.ts
```

**Al correr `npm test` en backend:**
- Vitest ejecuta `backend/src/test-setup.ts` PRIMERO
- Ese archivo carga `backend/.env.test` con `dotenv` usando `override: true`
- Esto sobreescribe `DATABASE_URL` para que apunte a `test.db` en lugar de `database.db`
- El `.env` de produccion NUNCA se carga en tests, solo se usa `.env.test`
- **Resultado: todas las queries de Prisma y better-sqlite3 van a `test.db`, no a la BD de produccion**

### Frontend Tests (Vitest)

```bash
cd frontend

# Ejecutar todos los tests
npm test

# Modo watch
npm run test:watch

# Un archivo especifico
npx vitest run src/features/profile/hooks/__tests__/useProfileEditor.test.ts
```

---

## Aislamiento de Base de Datos - Explicacion Detallada

### El problema: dos bases de datos, un mismo schema

El proyecto usa SQLite. Si los tests corrieran contra `database.db`, ensuciarian los datos reales. Para evitarlo, usamos **dos archivos de base de datos separados**:

| Archivo | Proposito | DATABASE_URL | Se commitea? |
|---|---|---|---|
| `prisma/src/data/database.db` | Produccion y desarrollo | `file:./prisma/src/data/database.db` (en `.env`) | No (gitignored) |
| `prisma/src/data/test.db` | Solo tests | `file:./prisma/src/data/test.db` (en `.env.test`) | No (gitignored por `*.db`) |

### Como se asegura que los tests NUNCA toquen la BD de produccion

**Capa 1 - Vitest setup (`backend/src/test-setup.ts`):**
```typescript
dotenv.config({ path: "../.env.test", override: true, quiet: true });
```
- Se ejecuta antes que cualquier test
- `override: true` garantiza que aunque `index.ts` haya cargado `.env` antes, `.env.test` gana
- Cambia `process.env.DATABASE_URL` → apunta a `test.db`
- Filtra ruido de consola (Turnstile no configurado, emails de Brevo fallando en test)

**Capa 2 - better-sqlite3 (`database.ts`):**
```typescript
const db = createYugiohDatabase("ruta/temporal/test.db");
```
- `createYugiohDatabase()` acepta un path opcional
- En tests, explicitamente pasas un path temporal o `:memory:`
- En produccion, no pasas nada y usa el default
- Ademas, cuando `NODE_ENV=test` el constructor automaticamente usa `test.db`

### Paso unico inicial: crear las tablas en test.db

Antes de correr tests por primera vez (y cada vez que cambies el schema), necesitas crear las tablas en `test.db`. Esto se hace con el mismo comando que ya usas normalmente, pero apuntando al test.db:

**En Windows (PowerShell):**
```powershell
cd backend
$env:DATABASE_URL="file:./src/data/test.db"; npx prisma db push
```

**Importante:** El path es `file:./src/data/test.db` (no `file:./prisma/src/data/test.db`). Prisma resuelve rutas relativas desde donde esta `schema.prisma` (que ya esta en `backend/prisma/`), asi que `./src/data/` = `backend/prisma/src/data/`.

**No necesitas correr `npx prisma generate` de nuevo** porque el cliente de Prisma ya esta generado (el schema no cambia, solo la BD a la que apunta).

### Como funciona NODE_ENV en tests (automatico)

Vitest establece `process.env.NODE_ENV = "test"` automaticamente al arrancar. Ademas, `.env.test` lo declara explicitamente con `NODE_ENV=test`. Esto tiene dos efectos:

1. **El servidor no arranca:** `backend/src/index.ts` tiene `if (process.env.NODE_ENV !== "test") { app.listen(...) }`. En tests, `app.listen()` no se ejecuta, evitando que el servidor ocupe un puerto.

2. **Rate limiting deshabilitado:** Los rate limiters de auth y reports se saltan en modo test para permitir requests rapidas.

3. **Cron jobs no se inician:** `startCleanupJob()` y `startTrendingSnapshotService()` estan dentro del bloque `app.listen()`, asi que no corren en tests.

### Limpieza entre tests

Para evitar que datos de un test contaminen otro, usar **DELETE al inicio de cada suite**:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeEach(async () => {
  // Limpiar tablas en orden (respetando foreign keys)
  await prisma.instanceLike.deleteMany();
  await prisma.instanceFavorite.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.archetypeInstance.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.customDeck.deleteMany();
  // NO limpiar User si usas better-auth (tiene su propia gestion)
});
```

---

## Preguntas Frecuentes

### Por que `.env.test` SI se commitea pero `.env` NO?

- `.env` contiene secrets reales (JWT_SECRET, BETTER_AUTH_SECRET, Cloudinary keys, etc.) → NO se commitea
- `.env.test` solo contiene `DATABASE_URL=file:./prisma/src/data/test.db` y `NODE_ENV=test` → sin secrets → SI se commitea para que el setup sea consistente
- `test.db` en si NO se commitea porque el `.gitignore` ya tiene `*.db`

### Si corro `npm test` en backend, ¿se carga el `.env` de produccion tambien?

No. El `dotenv.config()` en `index.ts` solo se ejecuta cuando levantas el servidor con `npm run dev`. Los tests con vitest NO pasan por `index.ts`, solo cargan `test-setup.ts` que lee `.env.test` con `override: true`.

### Que es `--schema=prisma/schema.prisma`? Por que no usas `npx prisma db push` a secas?

`--schema=prisma/schema.prisma` es redundante porque Prisma busca `prisma/schema.prisma` por defecto. Puedes usar simplemente `npx prisma db push`. La diferencia importante es el `DATABASE_URL` que apunta a `test.db`, no el flag `--schema`.

---

## Convenciones

### Nomenclatura:
- Archivos de test: `*.test.ts` (backend/frontend unit), `*.spec.ts` (E2E)
- `describe`: nombre del modulo/clase/feature que se testea
- `it` / `test`: debe describir el comportamiento esperado ("should save bio when user clicks save")

### Donde poner cada test:

| Si estas testeando... | Va en... |
|---|---|
| Un application service | `backend/src/application/services/__tests__/` |
| Un repositorio SQLite | `backend/src/infrastructure/repositories/__tests__/` |
| Un endpoint HTTP | `backend/src/http/controllers/__tests__/` |
| Un hook de React | `frontend/src/features/<feature>/hooks/__tests__/` |
| Un componente con logica interna | `frontend/src/features/<feature>/components/__tests__/` |
| Una funcion utilitaria pura | `__tests__/` junto al archivo que la exporta |

### Lo que NO necesita test:
- Componentes puramente presentacionales (solo JSX + Tailwind, sin logica de estado)
- Funciones triviales de una linea
- Codigo generado automaticamente (Prisma client, etc.)

---

## CI / Integracion Continua

Cuando se configure CI en el futuro:

```bash
# Backend unit + integration
cd backend && npm test

# Frontend unit
cd frontend && npm test
```

---

## Coverage (Cobertura de Tests)

### Como ver el coverage

```bash
cd backend
npm run coverage
```

Esto ejecuta todos los tests y genera un reporte en `backend/coverage/index.html`. Abrirlo en el navegador para ver:

- **% Lines**: Que porcentaje de lineas de codigo fueron ejecutadas por los tests
- **% Branches**: Que porcentaje de ramas condicionales (if/else, switch) fueron cubiertas
- **Uncovered Lines**: Lineas especificas que ningun test ejecuto

Tambien muestra la cobertura **por archivo**, agrupado por carpeta (`src/application/services/`, `src/infrastructure/repositories/`, etc.).

### Como interpretar el coverage

El coverage NO es un objetivo en si mismo. Un 100% de coverage no significa que los tests sean buenos. Lo importante es:

- **Controllers con logica de negocio** deben tener alta cobertura (auth, guides)
- **Repositorios** tendran baja cobertura si no se testearon aisladamente (lo cual es esperado — los tests HTTP los ejercitan indirectamente)
- **Routes** deben tener 100% (son simples definiciones de endpoints)
- **Servicios externos** (adapters de YGOProDeck, Cloudinary) tendran 0% y esta bien

### Coverage en frontend

```bash
cd frontend
npm run coverage
```

---

## Filosofia de Testing del Proyecto

### Por que testeamos a nivel HTTP (controllers) y no repositorios aislados

En este proyecto, **testear la capa HTTP (supertest) indirectamente cubre las capas inferiores**:

```
TEST HTTP (supertest)
  → controller
    → application service (logica de negocio)
      → repository (acceso a datos)
        → SQLite / Prisma
```

Cuando testeamos `POST /api/auth/register`, estamos ejercitando:
- El middleware de validacion
- El controller
- El application service (`RegisterUserWithBetterAuthApplicationService`)
- El repository (`SqliteUserRepository`)
- La base de datos

**Si testearamos repositorios aisladamente**, estariamos:
- Mockeando SQLite (complejo, bajo valor)
- Testeando queries SQL simples (SELECT, INSERT)
- Duplicando cobertura que ya dan los tests HTTP

**Excepcion**: servicios con logica propia compleja (como `ChangeUsernameWithBetterAuthApplicationService` con cooldown de 7 dias, o `GuideApplicationService` con limite de 20 favoritos) si ameritarian tests unitarios si no estuvieran ya cubiertos por los tests HTTP.

### Por que no tenemos tests E2E

Los tests de integracion HTTP (supertest) son la **primera linea de defensa** porque:

1. **Mas rapidos**: 66 tests en ~60s (sin coverage) vs E2E que tomarian 5-10s cada uno
2. **Mas precisos**: Podemos testear codigos de error exactos (400, 401, 403, 404)
3. **Mas confiables**: Sin dependencia del frontend, sin flakiness del navegador
4. **Mejor ROI**: Cubren toda la logica de negocio del backend

Los E2E se consideraran en el futuro para verificar **flujos completos frontend→backend** (registro → redireccion → ver nombre en UI), pero actualmente no son necesarios dado que la mayoria de la logica de negocio esta en el backend.

### Que NO necesita tests

- **Repositorios individuales**: Son wrappers finos sobre SQL. Ya cubiertos por tests HTTP.
- **BetterAuth nativo**: Es una libreria externa ya testeada por sus autores.
- **Componentes puramente presentacionales**: Solo JSX + Tailwind, sin logica.
- **Codigo generado**: Prisma client, tipos auto-generados.

---

## Notas Importantes

1. **NUNCA** ejecutes tests sin que `.env.test` este cargado. Vitest lo carga automaticamente via `src/test-setup.ts` al correr `npm test` en `backend/`.

2. **El primer setup requiere** crear las tablas en `test.db`:
   ```bash
   cd backend
   $env:DATABASE_URL="file:./src/data/test.db"; npx prisma db push
   ```

3. **Cada vez que cambies el schema de Prisma**, vuelve a correr el paso 2 para `test.db`.

4. **Variables de entorno:** No hardcodees secrets en tests. `.env.test` solo tiene `DATABASE_URL` y `NODE_ENV`.

5. **Mocks vs Real:** Prefiere integracion real para repositorios (usando `test.db`) y mocks para servicios externos (YGOProDeck API, Cloudinary, etc.).

6. **Coverage se genera** con `npm run coverage`. El reporte HTML esta en `backend/coverage/index.html`.