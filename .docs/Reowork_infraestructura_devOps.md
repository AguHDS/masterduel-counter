# Plan DevOps — Master Duel Counter

> Documento de trabajo. Es la guía paso a paso para migrar la infraestructura del proyecto a un entorno DevOps con Docker.
> Se ejecuta de la mano: cada fase tiene objetivo → pasos concretos → cómo verificar → rollback.
> Estado del plan: **en curso** (branch `Ag-88`). Fecha última actualización: 2026-09-10.

---

## 1. Objetivo

Transformar la infraestructura actual (configuración manual en el VPS: Nginx + Node + PM2) a un entorno **Dockerizado con CI/CD**, aplicando buenas prácticas de DevOps **en la medida justa para un proyecto personal** (1 droplet, ~1GB RAM, SQLite). Prioridades:

1. **No romper nada** (la web está en producción).
2. **Mínimo cambio de comportamiento** (Nginx, backups, restore y rutas SEO quedan igual).
3. Paso a paso, probando **en local (WSL + Docker)** antes de tocar el VPS.

---

## 2. Estado actual (resumen verificado)

- **Monorepo**: `backend/` (Express + TypeScript, better-sqlite3 + Prisma, SQLite) y `frontend/` (React + Vite, build estático).
- **VPS** (DigitalOcean droplet, ~1GB RAM, Ubuntu):
  - **Nginx del host**: sirve `frontend/dist`, proxya `/api` y rutas SEO/OG/sitemap al backend en `:3001`, sirve `uploads/` directo, SSL con Certbot.
  - **PM2** maneja el backend (`masterduel-backend`, `node dist/index.js`).
  - **Cron** (3 AM) corre `backend/scripts/backup-db.sh` → `sqlite3 .backup` + gzip → local (7) + Google Drive vía rclone (14).
  - **SQLite** en `backend/prisma/src/data/database.db` (bind-mounteada al container en la nueva arquitectura).
  - **Imágenes de cartas** en `backend/uploads/` (~14k archivos).
- **CI/CD actual (GitHub Actions, en `master`)**:
  - `ci.yml`: lint + build + test de backend y frontend en PRs.
  - `deploy.yml`: SSH al VPS → `git pull` + `npm ci` + `prisma migrate deploy` + build + `pm2 restart`.
- **Branch de trabajo actual**: `Ag-88` (al día con master). `ci.yml` y `deploy.yml` existen e iguales a master → se **reworkean en el lugar**.

---

## 3. Decisiones tomadas y trade-offs

| Decisión | Elección | Por qué |
|---|---|---|
| **Nginx** | Se queda en el host | Config, certs SSL y servir `uploads/` quedan intactos. Cero reescritura. |
| **Dockerizar** | Backend sí (container con `node dist/index.js`). Frontend: dist servido por Nginx del host | El backend es lo que corre procesos/DB. El frontend ya lo sirve Nginx del host; no aporta meter un nginx container más. |
| **Volúmenes** | Bind mounts en **las mismas rutas host actuales** | Nginx, backup y restore siguen funcionando sin cambios. |
| **Restart Server (Admin Panel)** | Cambio de código: exit graceful + `restart: unless-stopped` de Docker | Elimina la dependencia de PM2 sin montar sockets peligrosos. |
| **Migraciones Prisma** | En el entrypoint del container (`npx prisma migrate deploy && node dist/index.js`) | El deploy pasa a ser solo `pull + up -d`. No-op cuando no hay migraciones pendientes. |
| **CI/CD** | Imagen backend construida en CI → GHCR. VPS hace `pull + up -d`. Frontend: build en CI + copia `dist` al host | Compilar en el VPS de 1GB RAM es lento/arriesgado. GHCR con `GITHUB_TOKEN`, sin credenciales nuevas. |
| **Terraform** | Mínimo: droplet + firewall + DNS + cloud-init (instala Docker). **Al final**, con `terraform import` | Aprender IaC sin sobre-ingeniería. No recrear el droplet (no perder datos). |
| **HA** | Un solo replica + restart policy + healthcheck | SQLite no soporta bien multi-instancia; PM2 cluster se descarta (ver Fase 6). |
| **Observabilidad** | Ligera: Sentry (backend+frontend), alertas DigitalOcean/UptimeRobot, rotación de logs Docker | Prometheus/Grafana/Loki no caben en 1GB RAM y son overkill acá. |
| **Backups** | Sin cambios | El cron del host sigue corriendo contra el mismo path (bind mount). |

---

## 4. Arquitectura objetivo

```
                    Internet
                       │ (HTTPS)
                       ▼
        ┌──────────────────────────────┐
        │   Nginx del HOST (SIN CAMBIOS) │
        │  - SSL Certbot                 │
        │  - sirve frontend/dist         │
        │  - proxya /api → 127.0.0.1:3001│
        │  - rutas SEO/OG/sitemap → :3001│
        │  - sirve uploads/ directo      │
        └──────────────┬───────────────┘
                       │
               ┌───────▼───────┐
               │ Docker Engine │
               └───────┬───────┘
                       │ 127.0.0.1:3001
               ┌───────▼──────────────────────────────┐
               │ container: mdc-backend               │
               │  node dist/index.js                  │
               │  entrypoint: prisma migrate deploy   │
               │  restart: unless-stopped             │
               │  healthcheck: GET /api/status        │
               └───┬──────────┬──────────┬─────────┬──┘
                   │          │          │         │
          backend/prisma/   backend/   backend/  frontend/
           src/data (DB)    uploads/   data/     dist (ro)
              (bind mounts en las MISMAS rutas host actuales)
```

**Contenedor `/app` = contenido de `backend/`** (mismo layout que el repo), para que los paths relativos del código sigan resolviendo igual:

| Path dentro del container | Path en el host | Propósito |
|---|---|---|
| `/app/prisma/src/data` | `backend/prisma/src/data` | SQLite (`database.db`) — **rw** |
| `/app/uploads` | `backend/uploads` | imágenes de cartas — **rw** |
| `/app/data` | `backend/data` | `server-state.json` + `task-logs/` — **rw** |
| `/app/frontend/dist` | `frontend/dist` | build del frontend — **ro** (ver nota abajo) |

> **NOTA IMPORTANTE (SEO/OG)**: `backend/src/index.ts` registra los middlewares de OG preview, redirects 301 legacy y el SPA fallback **solo si** `frontend/dist` existe (`existsSync(FRONTEND_DIST)`). Hoy eso ocurre en el VPS porque el backend ve el dist. Para que en el container sigan activas esas rutas (que Nginx proxy-a al backend), montamos `frontend/dist` como volumen **ro** en `/app/frontend/dist`. Sin esto, el home OG, las previews de guías y los redirects legacy dejarían de responder (404).

---

## 5. Qué descartamos del plan original y por qué

| Ítem original | Decisión | Motivo |
|---|---|---|
| Terraform provisionando Node/Nginx/PM2 | Descartado | Docker reemplaza Node/PM2; Nginx queda en host. Terraform solo crea el droplet + firewall + DNS + cloud-init(Docker). |
| Dockerfile frontend con Nginx propio | Descartado (queda solo como preview local opcional) | Nginx del host ya sirve el dist. |
| Docker Hub | GHCR | Integrado con GitHub, gratis, `GITHUB_TOKEN` alcanza. |
| Notificaciones Discord/Email de deploys | **Opcional / al final** | No aporta hoy. Si se quiere, son 3 líneas en GitHub Actions (webhook). |
| PM2 en modo cluster (multi-instancia) | Descartado | SQLite no soporta escritura concurrente segura entre procesos; 1GB RAM no alcanza. Un solo replica + restart policy es lo correcto acá. |
| Prometheus + exporters + Grafana | Descartado | No cabe en 1GB RAM. Reemplazado por monitoreo ligero (Fase 7). |
| Loki / centralización de logs | Descartado | `docker compose logs` + rotación alcanzan. |
| `npm run download-all-cards`, thumbnails, etc. manuales | Se mantienen vía Server Management | Ya funciona con child processes (ver Fase 5, comportamiento Docker). |

---

## 6. Fases

Cada fase dice **qué**, **cómo** y **cómo verificar**. A medida que vayamos avanzando se va marcando `[x]`.

---

### FASE 0 — Preparación local (Windows + WSL + Docker)

**Objetivo**: tener el entorno local listo para construir y probar los containers **antes** de tocar el VPS.

Pasos:
1. En WSL (Ubuntu-24.04) verificar Docker Engine y el plugin compose:
   ```bash
   docker --version
   docker compose version
   ```
   - Si `docker compose` no existe, instalar el plugin (`docker-compose-plugin`). Si estás en Docker Desktop con WSL2 integrado, ya viene.
2. Verificar que la terminal de VS Code apunta a WSL: `wsl --list` (en PowerShell) y desde la terminal `pwd` debería dar una ruta de Linux.
3. Confirmar que el repo es accesible desde WSL. Dos opciones:
   - El repo está en `/mnt/c/Users/Usuario/Desktop/Ag/Visual Studio Projects/masterduel-counter` (acceso por `/mnt/c/...`). **OJO**: los bind mounts desde `/mnt/c` funcionan, pero el I/O es más lento y pueden haber problemas de permisos.
   - **Recomendado para trabajar cómodos**: clonar el repo dentro de WSL (`~/projects/masterduel-counter`). Para esta fase basta con que exista; lo decidimos juntos.
4. Probar un container de humo:
   ```bash
   docker run --rm hello-world
   ```

**Verificar**: `docker run --rm hello-world` imprime "Hello from Docker!".

**Notas**: No hace falta instalar nada en Windows. Toda la fase local se trabaja en WSL.

---

### FASE 1 — Dockerfile del backend + `.dockerignore`

**Objetivo**: construir la imagen del backend de forma reproducible.

1. Crear `backend/.dockerignore`:
   ```
   node_modules
   dist
   coverage
   .env
   .env.*
   *.log
   prisma/src/data
   src/data
   uploads
   data
   ```
   > Es **crítico** excluir `prisma/src/data` (¡la DB!), `uploads/`, `data/` y `.env` para no hornear datos/secrets dentro de la imagen.

2. Crear `backend/Dockerfile`:
   ```dockerfile
   # Single-stage a propósito: evita problemas con módulos nativos
   # (better-sqlite3, sharp) y mantiene prisma CLI disponible para migrate deploy.
   FROM node:20-slim

   WORKDIR /app

   # Copiar primero los manifests para aprovechar el cache de capas
   COPY backend/package.json backend/package-lock.json ./
   RUN npm ci --legacy-peer-deps

   COPY backend/ ./

   # Generar el cliente de Prisma y compilar TS
   RUN npx prisma generate
   RUN npm run build

   ENV NODE_ENV=production
   EXPOSE 3001

   ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
   ```
   > Base `node:20-slim` (Debian), **no** `alpine`: `better-sqlite3` y `sharp` son nativos y en alpine (musl) compilan distinto y dan problemas clásicos. `node:20` porque es la versión que ya usa CI.

3. Crear `backend/docker-entrypoint.sh`:
   ```sh
   #!/bin/sh
   set -e
   echo "[entrypoint] Aplicando migraciones de Prisma (no-op si no hay pendientes)..."
   npx prisma migrate deploy
   echo "[entrypoint] Arrancando backend..."
   exec node dist/index.js
   ```
   > `exec` es importante: reemplaza el proceso y así Node recibe las señales (SIGTERM) directamente. El `migrate deploy` aplica los cambios de schema a la DB montada; es no-op cuando no hay migraciones pendientes.

4. Construir localmente en WSL:
   ```bash
   cd <ruta-del-repo>
   docker build -f backend/Dockerfile -t mdc-backend:test .
   ```

**Verificar**:
- `docker build` termina OK.
- La imagen **no** contiene la DB: `docker run --rm --entrypoint sh mdc-backend:test -c "ls -la /app/prisma/src/data"` → debe estar vacío (o no existir).
- `docker run --rm --entrypoint sh mdc-backend:test -c "ls /app/dist/index.js"` → existe (build compilado).

**Rollback**: borrar la imagen `docker rmi mdc-backend:test`. No afecta nada en producción.

**Notas / decisiones**:
- Se eligió single-stage (simplicidad y menor riesgo de módulos nativos) sobre multi-stage (imagen más chica). Si en el futuro el tamaño molesta, se optimiza; no ahora.
- El entrypoint usa `npx prisma migrate deploy` en cada arranque (no-op si no hay pendientes). Reemplaza el `npx prisma migrate deploy` que hoy corre en `deploy.yml` y el `migrate resolve --applied 0_init` histórico ya no hace falta.

---

### FASE 2 — Cambio de código: restart Docker + shutdown graceful + healthcheck

**Objetivo**: adaptar la feature Server Management a Docker y permitir cierres limpios.

**2.1 Restart Server sin PM2**

`backend/src/application/services/ServerManagementApplicationService.ts`, en `restartServer()` (~línea 167): cuando la app corre en Docker, en vez de `pm2 restart`, terminamos el proceso con SIGTERM y Docker lo reinicia solo (restart policy).

```ts
restartServer(): Promise<{ success: boolean; message: string }> {
  if (process.env.NODE_ENV !== "production") {
    return Promise.resolve({
      success: false,
      message:
        "Restart is only available in production (pm2 is not running locally)",
    });
  }
  if (process.env.RUNNING_IN_DOCKER === "true") {
    // En Docker el restart lo maneja la restart policy del container:
    // al terminar el proceso, Docker lo levanta de nuevo.
    process.kill(process.pid, "SIGTERM");
    return Promise.resolve({
      success: true,
      message: "Server restart triggered (Docker)",
    });
  }
  try {
    // ... (código actual con pm2, para el caso de correr sin Docker)
  }
}
```

> La variable `RUNNING_IN_DOCKER=true` la define el compose (Fase 3), así el mismo código funciona en Docker y sin Docker.

**2.2 Graceful shutdown en `index.ts`**

Agregar un handler para cerrar la DB y el server de forma limpia al recibir SIGTERM/SIGINT (Docker envía SIGTERM al detener el container):

```ts
// index.ts, antes de app.listen
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  const deps = getDependencies();
  server.close(() => {
    deps.close(); // cierra better-sqlite3 + prisma
    process.exit(0);
  });
  // Fuerza el exit si algo se cuelga (evita que Docker espere 10s por defecto)
  setTimeout(() => process.exit(1), 10000).unref();
};

const server = app.listen(PORT, () => {
  startCleanupJob();
  startTrendingSnapshotService();
  startTierListScraperService();
});
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

> `server` hoy no está asignado a variable (`app.listen(...)`); lo asignamos. `deps.close()` ya existe en `compositionRoot.ts` (cierra DB + Prisma).

**2.3 Healthcheck**

No hace falta un endpoint nuevo: `GET /api/status` ya es público. El compose lo usará como healthcheck (Fase 3).

**Verificar**:
- `cd backend && npm run lint` sin errores.
- `npm test` pasa (los tests de server-management deben seguir verdes; el branch nuevo por `RUNNING_IN_DOCKER` no afecta `NODE_ENV=test`).
- **No correr tests yo solo**: los corre el dueño del repo (tú), o se validan en CI.

**Rollback**: revertir los dos cambios (git). No toca producción.

---

### FASE 3 — docker-compose (local primero)

**Objetivo**: un único `docker-compose.yml` en la raíz que sirva **local (WSL)** y **producción (VPS)**.

Crear `docker-compose.yml` en la raíz del repo:

```yaml
services:
  backend:
    image: ghcr.io/aguhds/masterduel-counter/backend:latest
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: mdc-backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    environment:
      RUNNING_IN_DOCKER: "true"
      NODE_ENV: production
    ports:
      - "127.0.0.1:3001:3001"
    volumes:
      - ./backend/prisma/src/data:/app/prisma/src/data
      - ./backend/uploads:/app/uploads
      - ./backend/data:/app/data
      - ./frontend/dist:/app/frontend/dist:ro
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3001/api/status').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 15s
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

> Detalles clave:
> - `image` + `build`: local hace `up -d --build`; en el VPS hace `pull` (usa la imagen de GHCR, ignora `build`).
> - `env_file` = el `.env` que ya existe en `backend/` (tiene los secrets y `DATABASE_URL=file:./src/data/database.db`, que Prisma resuelve relativo a `schema.prisma` → `/app/prisma/src/data/database.db`, que coincide con el bind mount). **No se cambia nada del `.env`**.
> - Puerto atado a `127.0.0.1`: solo Nginx del host lo ve, no se expone públicamente.
> - `NODE_ENV: production` se fuerza en el container (aunque el `.env` diga `development`, el container arranca en modo prod y los scripts usan `dist/`).
> - `frontend/dist` montado **ro** (explicado en Fase 1 / sección 4, para rutas SEO).

**Probar en local (WSL)**:
1. Copiar una DB de pruebas al path local (para no tocar la real): `cp backend/prisma/src/data/database.db /tmp/db-test/database.db` y apuntar temporalmente el volumen — **o**, más simple, primero probar con un volume temporal:
   ```bash
   # crear un dir de prueba
   mkdir -p /tmp/mdc-data/prisma/src/data
   cp <ruta-repo>/backend/prisma/src/data/database.db /tmp/mdc-data/prisma/src/data/database.db
   ```
2. Levantar contra ese dir (override temporal):
   ```bash
   docker compose up -d --build
   docker compose logs -f backend
   ```
   (Durante la fase local inicial, puede que necesites ajustar los volúmenes del compose a `/tmp/mdc-data/...` para no tocar tu DB de desarrollo. Lo resolvemos juntos en la práctica.)
3. Probar que responde: `curl -s http://127.0.0.1:3001/api/status` → `{"success":...,"maintenance":false,...}`.
4. Probar el healthcheck: `docker compose ps` → columna STATUS `healthy`.
5. Probar el restart del Admin Panel (local dev rechaza por `NODE_ENV`; en el container es `production`, así que **no** lo pruebas localmente para no romper nada — se valida en el VPS).

**Verificar**: `curl` responde, `docker compose ps` muestra `healthy`, y los logs no tienen errores.

**Rollback**: `docker compose down` (no borra los volúmenes bind, tus datos quedan intactos). No afecta producción.

**Notas**:
- El container corre como root (default de la imagen). Para un proyecto personal es aceptable; se anota como trade-off de seguridad.
- En local, `frontend/dist` debe existir para el mount `ro` (si no existe la carpeta, Docker la crea como root en el host; generamos un `frontend/dist` vacío si hace falta o lo construimos con `npm run build`).

---

### FASE 4 — GHCR + CI/CD (rework de workflows)

**Objetivo**: build de la imagen en CI, push a GHCR, deploy Docker en el VPS, y frontend con build en CI.

**4.1 Preparar GHCR**
- El paquete se publica con el repo como `ghcr.io/aguhds/masterduel-counter/backend`.
- `GITHUB_TOKEN` del workflow alcanza para publicar (permiso `packages: write`).
- **Visibilidad**: recomendado **público** (el repo ya es público) → el VPS no necesita login para `pull`. Alternativa: privado + `docker login ghcr.io` con PAT en el VPS (se documenta en Fase 5 como opción).

**4.2 `ci.yml` (PR → master)** — conservar los jobs actuales (lint/build/test) y **agregar** un job que valide que el Dockerfile construye (sin push):

```yaml
  docker-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: backend/Dockerfile
          push: false
          tags: ghcr.io/${{ github.repository_owner }}/masterduel-counter/backend:pr-check
```

**4.3 `deploy.yml` (push → master)** — reescribir:

```yaml
name: Deploy to Droplet

on:
  push:
    branches: [master]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: backend/Dockerfile
          push: true
          tags: |
            ghcr.io/${{ github.repository_owner }}/masterduel-counter/backend:latest
            ghcr.io/${{ github.repository_owner }}/masterduel-counter/backend:${{ github.sha }}

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
      - uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist

  deploy:
    runs-on: ubuntu-latest
    needs: [build-and-push, frontend-build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: frontend-dist
          path: frontend-dist

      - name: Copy frontend dist to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "frontend-dist/*"
          target: /var/www/masterduel-counter/frontend
          strip_components: 1
          # El script de deploy (abajo) limpia dist antes de copiar

      - name: Deploy backend container
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            set -e
            cd /var/www/masterduel-counter

            # Limpiar dist viejo y reemplazar con el nuevo (evita archivos huérfanos)
            rm -rf frontend/dist
            mkdir -p frontend/dist

            git stash || true
            git pull origin master

            # (opcional, si el paquete GHCR fuera privado)
            # echo "${{ secrets.GHCR_PAT }}" | docker login ghcr.io -u "${{ secrets.GHCR_USER }}" --password-stdin

            docker compose pull
            docker compose up -d

            # Esperar healthcheck
            for i in $(seq 1 30); do
              if docker inspect --format='{{.State.Health.Status}}' mdc-backend 2>/dev/null | grep -q healthy; then
                echo "Backend healthy"
                break
              fi
              sleep 5
            done
            docker compose ps
```

> Notas:
> - El **entrypoint** aplica `prisma migrate deploy` solo, así que el deploy ya no corre migraciones en el host.
> - `rm -rf frontend/dist` + scp evita archivos huérfanos (comportamiento de rsync `--delete`).
> - Si el paquete GHCR es privado: descomentar el login y crear secrets `GHCR_PAT` (PAT con `read:packages`) y `GHCR_USER`.
> - Rollback de app: `docker compose up -d` con el tag anterior, o `git revert` del commit + redeploy (el workflow deja el tag por SHA).

**Verificar**:
- Push a `master` (o PR a master) dispara los workflows y terminan en verde.
- En GHCR aparece el paquete `ghcr.io/aguhds/masterduel-counter/backend` con tags `latest` y el SHA.
- El VPS logra `docker compose pull` (ver Fase 5; hasta entonces el workflow de deploy falla en el `pull` si Docker no está instalado — por eso Fase 5 primero).

**Notas**: estos cambios se hacen en `Ag-88` y se activan al mergear a `master` (el deploy dispara en push a master).

---

### FASE 5 — Migración del VPS

**Objetivo**: pasar el backend de PM2 a Docker **sin perder datos ni romper Nginx/backups**.

> ⚠️ Esta fase toca producción. Se hace de día y con el backup listo (el cron de las 3 AM ya existe, pero hacemos uno manual antes).

**5.1 Pre-migración**
1. Backup manual de la DB (por si acaso):
   ```bash
   bash /var/www/masterduel-counter/backend/scripts/backup-db.sh
   ```
2. Confirmar config de Nginx intacta (no la tocamos) y que `frontend/dist` existe (para el mount ro).

**5.2 Instalar Docker Engine + compose plugin en el VPS**
```bash
# Repo oficial de Docker (Ubuntu)
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
Verificar:
```bash
sudo docker run --rm hello-world
docker compose version   # si falla, probar: sudo docker compose version
```
> Si el usuario con el que entras (root) ya puede usar docker sin sudo, mejor; si no, usar `sudo` o agregar el usuario al grupo `docker`.

**5.3 Poner el compose en el VPS**
- El `docker-compose.yml` llega con `git pull` (está en `master` tras mergear Ag-88).
- Si aún no mergeamos, se puede copiar manualmente a `/var/www/masterduel-counter/docker-compose.yml` para validar.

**5.4 Corte (downtime de ~segundos)**
```bash
cd /var/www/masterduel-counter

# 1. Detener el backend de PM2 (libera el puerto 3001)
pm2 stop masterduel-backend

# 2. Levantar el container
sudo docker compose up -d

# 3. Verificar salud
sudo docker compose ps
curl -s http://127.0.0.1:3001/api/status
```

**5.5 Validación completa (SEO / estáticos / API / imágenes)**
```bash
# Home OG (Discord) → debe devolver HTML con meta tags
curl -s https://masterduelcounter.com/ | head -50

# Sitemap
curl -s -o /dev/null -w "%{http_code}\n" https://masterduelcounter.com/sitemap.xml   # 200

# Una guía SEO-friendly (preview OG) → 200
curl -s -o /dev/null -w "%{http_code}\n" "https://masterduelcounter.com/archetypes/test/counter-guides" 

# Una imagen de carta servida por nginx desde uploads/ → 200
curl -s -o /dev/null -w "%{http_code}\n" https://masterduelcounter.com/api/uploads/cards/<un-card-id>.jpg

# API normal
curl -s https://masterduelcounter.com/api/status

# Un GET con Googlebot → 200 (sin rate limit)
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" -s -o /dev/null -w "%{http_code}\n" https://masterduelcounter.com/tierlist
```
- Revisar `pm2` ya no corre el backend: `pm2 status` (debe estar sin `masterduel-backend` corriendo).
- Revisar los logs del container: `sudo docker compose logs --tail 50 backend`.

**5.6 Eliminar PM2 (cuando ya estés confiado, ~1 semana después)**
```bash
pm2 delete masterduel-backend
pm2 save
pm2 kill
# (opcional) desactivar el servicio systemd de pm2: systemctl disable pm2-<user>
```
> Dejar Node en el sistema no molesta; si algún día se quiere, se desinstala. El backup usa `sqlite3` + `rclone` (host), que no dependen de Node ni de PM2.

**5.7 Verificar backups**
```bash
# Correr el backup manualmente y ver que funciona contra el bind mount
bash /var/www/masterduel-counter/backend/scripts/backup-db.sh
tail -5 /var/log/db-backup.log
ls -lt /var/www/masterduel-counter/backups/ | head
```

**Verificar**: los curls de 5.5 dan 200, `docker compose ps` muestra `healthy`, backup crea archivo nuevo.

**ROLLBACK (importante)**:
- **Rollback de app a versión anterior**: `docker compose up -d` con el tag SHA anterior (editar `image:` o pasar `-e`), o `git revert` del commit + redeploy.
- **Rollback completo a PM2** (si Docker fallara feo):
  ```bash
  sudo docker compose down
  cd /var/www/masterduel-counter/backend
  npm ci --legacy-peer-deps
  npx prisma migrate deploy
  npm run build
  pm2 start npm --name "masterduel-backend" -- start
  pm2 save
  ```
  > La DB y uploads siguen en las mismas rutas (bind mounts), así que PM2 retoma exactamente el mismo estado. Nginx nunca dejó de apuntar a `127.0.0.1:3001`.

**Notas Docker del Server Management (comportamiento)**
- Los scripts de mantenimiento (download-cards, thumbnails, etc.) se spawnean como child processes de Node **dentro del container** → siguen funcionando igual (escriben en `/app/uploads` y `/app/data`, que son los bind mounts).
- **Diferencia**: si el container se reinicia a mitad de tarea, la tarea se pierde (el proceso detached muere con el container). En PM2 sobrevivía. Aceptable para proyecto personal; se nota.
- El botón **Restart Server** ahora termina el proceso → Docker lo levanta de nuevo (Fase 2). El status/healthcheck reportan el reinicio.

---

### FASE 6 — HA básica (sin cluster)

**Objetivo**: auto-recuperación ante crash y reboot del droplet.

- **Ya incluido** en el compose: `restart: unless-stopped` → si el proceso crashea, Docker lo reinicia; si el droplet reinicia, Docker (systemd) levanta el container solo.
- **Healthcheck** (`/api/status`) ya definido: da visibilidad de salud y `docker compose ps` lo muestra.
- **¿Por qué NO cluster/multi-replica?** SQLite es single-writer: dos instancias del backend peleando por el mismo archivo → locks y corrupción potencial. Además, 1GB RAM no alcanza. La estrategia correcta acá es **1 replica + restart policy**. Si algún día se necesita escalar → migrar a Postgres (fuera de este plan).

**Verificar**: `sudo docker compose ps` muestra `healthy`; probar `sudo docker restart mdc-backend` y confirmar que vuelve solo y sano.

**Rollback**: N/A (es config del compose).

---

### FASE 7 — Observabilidad ligera

**Objetivo**: ver errores, caídas y recursos **sin** meter infra pesada al VPS.

1. **Sentry** (errores + alertas):
   - Frontend ya tiene `@sentry/react`.
   - Backend: instalar `@sentry/node`, inicializar en `index.ts` con `SENTRY_DSN` (agregar al `env.example` y al `.env` del VPS). Enviar errores de Express vía middleware/handlers.
2. **Alertas de DigitalOcean** (gratis, email): habilitar Monitoring del droplet + políticas de alerta:
   - CPU > 80%, Memoria > 80%, Disco > 90%, droplet offline.
3. **UptimeRobot** (opcional, externo): HTTPS check a `https://masterduelcounter.com` → email si cae. Free tier alcanza.
4. **Logs**: ya configurados en compose (`json-file`, max 10m, 3 archivos). Ver con `sudo docker compose logs -f backend`.
5. **Comandos de reemplazo** (actualizar docs en Fase 9): `pm2 logs` → `docker compose logs`; `pm2 status` → `docker compose ps`; `free -h`/`htop` siguen igual.

**Verificar**: un error a propósito en dev genera un evento en Sentry; una alerta de DO se configura y queda activa.

**Rollback**: desactivar lo que se quiera (Sentry es código, se puede revertir).

---

### FASE 8 — Terraform mínimo (droplet + firewall + DNS + cloud-init)

**Objetivo**: tener la infraestructura del droplet definida como código para poder **recrearla desde cero** documentadamente.

> Se hace **al final**, cuando la migración a Docker ya esté estable, y usando `terraform import` para **no recrear** el droplet actual (recrear = perder datos si el backup fallara).

1. Estructura en el repo: `infra/terraform/` con `main.tf`, `variables.tf`, `outputs.tf`, `user_data.sh`, `terraform.tfvars` (gitignored) y `.gitignore` para el state.

2. `main.tf` (esquema):
   - Provider `digitalocean` (token desde env `DIGITALOCEAN_TOKEN`).
   - `digitalocean_droplet` (misma región/tamaño/imagen que el actual; variables).
   - `digitalocean_firewall` (22, 80, 443, sólo entrantes a esos puertos).
   - `digitalocean_record` para `masterduelcounter.com` → IP del droplet (solo si el DNS está en DigitalOcean; si está en otro proveedor, se documenta el cambio manual de DNS).
   - `user_data` = `user_data.sh` (cloud-init): instala Docker Engine + compose plugin (los mismos comandos de la Fase 5.2). **Ojo**: `user_data` solo se aplica al crear un droplet nuevo, no al importado.

3. Flujo:
   ```bash
   cd infra/terraform
   terraform init
   # Importar el droplet existente (no recrearlo):
   #   obtener el ID en DO console (o `doctl compute droplet list`)
   terraform import digitalocean_droplet.mdc <DROPLET_ID>
   terraform plan   # debe salir "no changes" tras ajustar variables al estado real
   terraform apply
   ```
4. Documentar la recreación desde cero: droplet nuevo (con user_data → Docker ya instalado) + `git clone` + copiar `.env` + `docker compose up -d` + restaurar DB desde Drive (ver `database_backup_guide.md`).

**Verificar**: `terraform plan` no muestra cambios destructivos sobre el droplet importado; `terraform apply` deja el estado idéntico.

**Rollback**: `terraform destroy` solo si se quiere destruir todo (¡con datos!); para reversión de cambios pequeños, `git revert` del código de terraform + `terraform apply`.

---

### FASE 9 — Documentación / runbook

**Objetivo**: que quede documentado cómo se despliega, monitorea y recupera.

1. **README.md**: diagrama de arquitectura (el de la sección 4), stack, cómo correr local (compose), cómo desplegar, cómo hacer rollback, cómo monitorear, decisiones y trade-offs.
2. **Actualizar `.docs/`** que mencionan PM2:
   - `VPS_COMMANDS.md`: reemplazar sección PM2 por comandos Docker (`docker compose up -d --build`, `docker compose pull`, `docker compose ps`, `docker compose logs -f backend`, `docker compose restart backend`). Mantener Nginx y backups igual.
   - `server-management.md`: actualizar "Dev vs Prod" (restart en Docker = exit graceful) y la sección de cómo funciona (child processes dentro del container; tarea muere si se reinicia el container).
   - `scripts.md`: sección "Server Management" queda igual (la feature no cambia de UI); ajustar notas de prod.
   - `database_backup_guide.md`: los pasos de restauración que usan `pm2 stop/start masterduel-backend` → reemplazar por `sudo docker compose stop backend` / `sudo docker compose start backend`. El resto (rutas, rclone, .backup) no cambia.
   - `memory.md`: actualizar la sección de arquitectura y notas (docker en vez de pm2).
3. **Tabla de escenarios de fallo y recuperación** (en README o `.docs/runbook.md`):
   - Backend crashea → restart policy (auto).
   - Droplet reinicia → container vuelve solo (auto).
   - Deploy rompe la app → rollback a tag anterior / `git revert` + redeploy / rollback completo a PM2.
   - DB corrupta / borrada → restaurar backup (guía de backup, ahora con docker compose stop/start).
   - Droplet destruido → Terraform `apply` (droplet nuevo con Docker) + restore desde Drive.

---

## 7. Checklist global (para ir marcando)

- [ ] Fase 0: Docker + WSL listos
- [ ] Fase 1: Dockerfile backend + .dockerignore construyen OK
- [ ] Fase 2: restart Docker + shutdown graceful + healthcheck (lint/test en CI)
- [ ] Fase 3: compose local levanta y responde
- [ ] Fase 4: GHCR + ci.yml + deploy.yml reworkeados
- [ ] Fase 5: VPS migrado a Docker, Nginx/SEO/backups validados
- [ ] Fase 5.6: PM2 eliminado (tras confianza)
- [ ] Fase 6: restart policy + healthcheck funcionando
- [ ] Fase 7: Sentry backend + alertas DO/UptimeRobot + logs rotados
- [ ] Fase 8: Terraform import + apply sin cambios
- [ ] Fase 9: docs actualizadas (README + .docs)
- [ ] Merge de Ag-88 a master (activa los nuevos workflows)

---

## 8. Notas generales

- **Todo lo de infra va versionado en git** (Dockerfile, compose, workflows, terraform, docs).
- **Secretos nunca en el repo**: `.env` sigue gitignored; GHCR no contiene secrets (la imagen no incluye `.env` ni la DB).
- **Probamos cada fase en local antes de tocar el VPS** (excepto cosas que solo existen en prod, como el restart en Docker).
- Se documentan errores/soluciones en este archivo a medida que aparezcan.