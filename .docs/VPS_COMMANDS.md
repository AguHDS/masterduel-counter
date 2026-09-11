## Rebuildear backend
- npm run build
- pm2 restart masterduel-backend
- systemctl reload nginx
Cuando reiniciar nginx:
La configuración de nginx (rutas, headers, etc.)
Los certificados SSL
Los upstreams del backend


## ver cfg nginx
cat /etc/nginx/sites-available/masterduelcounter
## editar nginx
sudo nano /etc/nginx/sites-available/masterduelcounter
# Guardar CTRL+O ENTER -> CTRL X
# Verificar sintaxis
sudo nginx -t
# Ver configuración completa
sudo nginx -T
`Nota: client_max_body_size 5M en nginx y express.json({ limit: "5mb" }) en backend para evitar errores 413 Payload Too Large`

## Descargar imagenes de cartas (Opcional)
# Descarga ~14,000 imagenes de YGOProDeck al filesystem (uploads/cards/)
# Sin delay (local PC): npm run download-all-cards
# Con delay 250ms (VPS con poca RAM): usar --delay 250
# Con limite (para testear): --limit 100
cd /var/www/masterduel-counter/backend
pm2 stop masterduel-backend
npm run download-all-cards -- --delay 250
pm2 start masterduel-backend
# Tiempo estimado sin delay: ~30-60 min (depende de internet)
# Tiempo estimado con delay 250ms: ~3-4 horas
# Importante: Este comando solo guarda archivos en disco (uploads/cards/).
# No guarda metadata en la tabla "cards" de la DB
# Las cartas se agregan a la DB automaticamente cuando un usuario
# las usa en una guia (via selectCard/confirmCards)

## Thumbnails optimizados (Opcional)
# Pre-generar cache de thumbnails para todas las cartas (10-20 min)
cd /var/www/masterduel-counter/backend
pm2 stop masterduel-backend
npm run generate-thumbnails:prod
pm2 start masterduel-backend
# Nota: Los thumbnails se generan automaticamente on-demand si no se pre-generan

## Reiniciar DB

pm2 stop all -> Detener todos los servicios

cd /var/www/masterduel-counter/backend/prisma/src/data
rm database.db -> Eliminar la base de datos actual

cd /var/www/masterduel-counter/backend
npx prisma db push > Crear la nueva base de datos con el nuevo esquema
npx prisma migrate deploy -> Aplicar las migraciones

# Reiniciar backend
pm2 restart masterduel-backend

-------------

## Monitoreo y Mantenimiento

pm2 logs masterduel-backend -> Ver logs en tiempo real

pm2 restart masterduel-backend -> Reiniciar el servicio

pm2 status -> Ver estado de los servicios

pm2 stop all -> Detener todos los servicios

pm2 start all -> Iniciar todos los servicios

--------------

## Monitorear uso de memoria VPS
free -h -> Ver uso de memoria RAM y swap
htop -> Ver uso de CPU, memoria y procesos en tiempo real

--------------

## Server Management (Admin Panel)

Desde el Admin Panel -> **Server Management** se pueden ejecutar los scripts de mantenimiento sin entrar al VPS:

- **Download Card Images**: `download-all-cards` (corre con `--delay 250` en producción; acepta `--limit`).
- **Populate Archetypes**: `populate-archetypes` (rápido).
- **Generate Thumbnails**: `generate-thumbnails`.
- **Update Card Details**: `update-card-details`.
- **Migrate Card Images**: `migrate-card-images`.
- **Restart Server**: `pm2 restart masterduel-backend` (solo producción).

**Cómo funciona:**
- El backend lanza cada script como un **child process detached** (`node dist/scripts/<script>.js` en prod / `node --import tsx src/scripts/<script>.ts` en dev), con output a `backend/data/task-logs/<id>.log`.
- Las tareas pesadas (`download-cards`, `generate-thumbnails`, `update-card-details`, `migrate-card-images`) activan **maintenance mode** automáticamente (los usuarios ven "We're doing some improvements"; los admins siguen entrando con un banner).
- Se puede monitorear el progreso (tail del log) y **cancelar** la tarea desde el panel.
- Estado persistido en `backend/data/server-state.json` (sobrevive reinicios del backend).
- Endpoint público `GET /api/status` devuelve `{ maintenance, message }` que usa el frontend para el maintenance screen.

**Nota RAM (VPS ~1GB):** el backend queda corriendo mientras corre una descarga (necesario para reportar progreso). Se mitiga con `--delay 250` y el bajo tráfico del modo mantenimiento. Las tareas que solo tocan filesystem (`download-cards`, `generate-thumbnails`) no escriben a la DB.

-------------

CFG NGINX:

# Redirect www to non-www
server {
    server_name www.masterduelcounter.com;
    return 301 https://masterduelcounter.com$request_uri;

    client_max_body_size 5M;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/masterduelcounter.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/masterduelcounter.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# Main site
server {
    server_name masterduelcounter.com;

    client_max_body_size 5M;

    root /var/www/masterduel-counter/frontend/dist;
    index index.html;

    # Servir favicon explícitamente
    location = /favicon.ico {
        access_log off;
        log_not_found off;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Servir otros archivos estáticos con cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Home OG dinámico (Discord/Twitter/Slack para dominio raíz)
    # Debe ir antes de location /
    location = / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Sitemap dinámico desde backend
    location = /sitemap.xml {
        proxy_pass http://localhost:3001/sitemap.xml;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Dynamic thumbnail generation (MUST come BEFORE static uploads)
    location ^~ /api/uploads/cards/thumb/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Servir imágenes de cartas directamente desde nginx (mejor rendimiento)
    location ^~ /api/uploads/ {
        alias /var/www/masterduel-counter/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy para el backend API
    location ^~ /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_read_timeout 120s;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # OG Preview dinámico para Discord/Twitter (URLs legacy)
    location ~ ^/archetype/[0-9]+/instance/[0-9]+/?$ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_read_timeout 120s;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # OG Preview dinámico para Discord/Twitter (URLs SEO-friendly)
    location ~ ^/archetypes/[^/]+/[^/]+/[^/]+-[0-9]+/?$ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_read_timeout 120s;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback - DEBE IR AL FINAL
    location / {
        try_files $uri $uri/ /index.html;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/masterduelcounter.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/masterduelcounter.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = masterduelcounter.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    client_max_body_size 5M;

    listen 80;
    server_name masterduelcounter.com;
    return 404; # managed by Certbot
}

server {
    if ($host = www.masterduelcounter.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name www.masterduelcounter.com;
    return 404; # managed by Certbot
} 