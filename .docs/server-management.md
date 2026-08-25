# Server Management (Admin Panel)

Feature del Admin Panel para ejecutar los scripts de mantenimiento del backend (descargar imágenes de cartas, poblar arquetipos, generar thumbnails, etc.) y reiniciar el servidor, **sin entrar al VPS por SSH**.

## Que expone

Nueva tab **"Server Management"** en el Admin Panel con:

- **Maintenance Mode**: toggle manual + mensaje opcional. Los usuarios ven "We're doing some improvements, come back soon"; los admins pasan (con un banner).

- **Tareas de mantenimiento** (cada una con botón "Run Task"):

  - Download Card Images  
    Ejecuta `download-all-cards` -> en producción usar `--delay 250` para no sobrecargar el servidor; `--limit` es opcional y solo para pruebas.  
    →->Mantenimiento automático: Sí
  - Populate Archetypes  
    Ejecuta `populate-archetypes` -> llena la base de datos con los arquetipos disponibles.  
    -> Mantenimiento automático: No
  - Generate Thumbnails  
    Ejecuta `generate-thumbnails` -> crea las versiones en miniatura de las imágenes.  
    -> Mantenimiento automático: Sí
  - Update Card Details  
    Ejecuta `update-card-details` -> actualiza la información de cada carta (texto, atributos, etc.).  
    -> Mantenimiento automático: Sí
  - Migrate Card Images  
    Ejecuta `migrate-card-images` -> mueve las imágenes de una ubicación a otra si es necesario.  
    -> Mantenimiento automático: Sí

- **Restart Server**  
  Ejecuta `pm2 restart masterduel-backend` → solo disponible en producción, para reiniciar el servicio.

- **Monitoreo de la tarea corriendo** (tail del log) + botón **Cancel**.

## Cómo funciona (backend)

```
Admin clickea "Run Task"
  └─ POST /api/admin/server/tasks { type, options? }   (verifyAdminMiddleware)
       └─ ServerManagementApplicationService.startTask()
            ├─ ServerTaskRunner.spawnTask()
            │    ├─ prod: node dist/scripts/<script>.js   (env heredado)
            │    └─ dev:  node --import tsx src/scripts/<script>.ts
            │    ├─ child process detached + unref (sobrevive a un reinicio del backend)
            │    └─ stdout/stderr → backend/data/task-logs/<id>.log (fd numérico)
            ├─ estado → ServerStateStore (backend/data/server-state.json)
            └─ si es tarea pesada → maintenance ON (auto)
child.on("exit") → estado done/failed/cancelled + maintenance OFF (si era auto)
```

- **Allowlist estricta**: el `type` mapea a un comando fijo (`TASKS` en `ServerTaskRunner.ts`). Nunca se interpola input del admin en el comando → no hay command injection.
- **Estado**: `backend/data/server-state.json` (maintenance + tarea activa + última tarea). Cache en memoria; sobrevive reinicios. Al consultar, reconcilia por PID si el backend se reinició a mitad de tarea (tarea detached sigue viva → se vuelve a detectar; si el PID murió → se marca failed).
- **Maintenance auto**: si una tarea pesada termina/falla/se cancela y el maintenance fue activado por ella (`auto=true`), se apaga solo. Un toggle manual (`auto=false`) no se toca al terminar la tarea.

### Endpoints

- **GET** `/api/status` → Público. Devuelve `{ maintenance, message }` → lo usa el frontend para el gate de mantenimiento.
- **GET** `/api/admin/server/state` → Admin. Devuelve el estado completo del servidor + tail del log en tiempo real.
- **POST** `/api/admin/server/tasks` → Admin. Inicia una tarea de mantenimiento → devuelve 409 si ya hay una tarea corriendo.
- **POST** `/api/admin/server/tasks/:id/cancel` → Admin. Cancela la tarea en ejecución → envía SIGTERM al child process.
- **PUT** `/api/admin/server/maintenance` → Admin. Toggle manual del modo mantenimiento → body: `{ enabled, message? }` (mensaje opcional).
- **POST** `/api/admin/server/restart` → Admin. Reinicia el servidor → ejecuta `pm2 restart masterduel-backend` (solo disponible en producción).
## Cómo funciona (frontend)

- **`ServerManagementTab`** (tab del panel): botones, inputs delay/limit para download-cards, tarjeta de tarea corriendo (poll cada ~4s mientras corre, 30s si no), toggle de maintenance, restart con confirmación.
- **Maintenance gate** (`SiteStatusGate` en `App.tsx`): usa `useSiteStatus` (`GET /api/status`, poll 30s). Regla: `maintenance && role !== "admin"` → `MaintenanceScreen`. Admins pasan con banner. Rutas de auth (`/signin`, `/signup`, `/verify-email`, `/reset-password`) eximidas para poder loguearse durante mantenimiento.
- Query keys: `queryKeys.admin.server.state()` y `queryKeys.siteStatus.current()`.

## Dev vs Prod

| | Dev (local) | Prod (VPS) |
| Comando | `node --import tsx src/scripts/*.ts` | `node dist/scripts/*.js` |
| Delay por defecto (download-cards) | 0 | 250 |
| Restart | Rechazado ("solo producción") | `pm2 restart masterduel-backend` |

## Seguridad / notas

- Todos los endpoints admin requieren `verifyAdminMiddleware` (rol `admin`).
- `/api/status` público expone solo el flag de maintenance (sin info sensible).
- **RAM (VPS ~1GB)**: el backend queda corriendo mientras corre la tarea (necesario para reportar progreso). Se mitiga con `--delay 250` y el bajo tráfico del modo mantenimiento. Las tareas que solo tocan filesystem (`download-cards`, `generate-thumbnails`) no escriben a la DB.
- **Lock de SQLite**: `update-card-details` y `migrate-card-images` escriben a tablas compartidas; el maintenance (poco tráfico) minimiza colisiones.
- En prod, el backend debe tener `dist/` construido (`npm run build`) para que los scripts se lancen desde `dist/scripts/`.

## Archivos clave

- Backend: `src/infrastructure/server/ServerTaskRunner.ts`, `src/infrastructure/server/ServerStateStore.ts`, `src/application/services/ServerManagementApplicationService.ts`, `src/application/ports/ServerManagementApplicationPort.ts`, `src/domain/ServerManagement.ts`, controllers en `src/http/controllers/admin/` + `src/http/controllers/status/getStatusController.ts`, `src/routes/status.ts`, rutas en `src/routes/admin.ts`.
- Frontend: `src/features/admin-panel/components/ServerManagementTab.tsx`, `src/features/admin-panel/hooks/useServerManagement.ts`, `src/features/admin-panel/api/adminApi.ts`, `src/shared/components/SiteStatusGate.tsx`, `src/shared/components/MaintenanceScreen.tsx`.