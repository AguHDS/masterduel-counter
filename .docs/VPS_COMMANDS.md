## Conexión al Servidor VPS
```bash
ssh root@104.236.51.1
# Password: project-TON618a
cd /var/www/masterduel-counter
```

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
## Verificar nginx
# Verificar sintaxis
sudo nginx -t
# Ver configuración completa
sudo nginx -T
`Nota: Acordarse de permitir hasta 3MB como max en la cfg de nginx para evitar errores 413 Payload Too Large`

## Thumbnails optimizados (Opcional)
# Pre-generar cache de thumbnails para todas las cartas (10-20 min)
cd /var/www/masterduel-counter/backend
pm2 stop masterduel-backend
npm run generate-thumbnails:prod
pm2 start masterduel-backend
# Nota: Los thumbnails se generan automáticamente on-demand si no se pre-generan

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

-------------

CFG NGINX:
# Redirect www to non-www
server {
    server_name www.masterduelcounter.com;
    return 301 https://masterduelcounter.com$request_uri;

    client_max_body_size 3M;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/masterduelcounter.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/masterduelcounter.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

# Main site
server {
    server_name masterduelcounter.com;

    client_max_body_size 3M;

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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # OG Preview dinámico para Discord/Twitter (URLs SEO-friendly)
    location ~ ^/archetypes/[^/]+/[^/]+/[^/]+-[0-9]+/?$ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
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

    client_max_body_size 3M;

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