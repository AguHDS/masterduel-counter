# Fix OG Preview en Nginx (sin romper configuración actual)

Objetivo: que las URLs de guías como `/archetype/73/instance/15?type=deck` pasen por tu backend Node (puerto `3001`) para que `guideOgPreviewMiddleware` inyecte metatags OG dinámicos para Discord.

## 1) Conectarte al VPS

```bash
ssh TU_USUARIO@TU_IP_O_HOST
```

## 2) Ubicar y respaldar la config activa de Nginx

```bash
sudo nginx -T > ~/nginx-full-backup-$(date +%Y%m%d-%H%M%S).conf
```

Si usas sitios por archivo, normalmente están en:

- `/etc/nginx/sites-available/`
- `/etc/nginx/sites-enabled/`

Revisa dónde está tu `server_name masterduelcounter.com www.masterduelcounter.com`.

## 3) Editar SOLO el bloque `server` del dominio

Abre el archivo de ese dominio y agrega este `location` (sin tocar lo demás):

```nginx
# OG preview dinámico para guías (Discord/Twitter/etc.)
location ~ ^/archetype/[0-9]+/instance/[0-9]+/?$ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Notas importantes:
- Este bloque debe quedar dentro del mismo `server { ... }` del dominio público.
- No uses `proxy_pass .../` con slash final en este caso.
- No elimines tus locations existentes de estáticos/API.

## 4) Validar sintaxis antes de recargar

```bash
sudo nginx -t
```

Si falla, no recargues. Corrige y vuelve a ejecutar `nginx -t`.

## 5) Recargar Nginx

```bash
sudo systemctl reload nginx
```

## 6) Verificar que el middleware de OG ahora responde

Desde tu máquina local o VPS:

```bash
curl -I "https://www.masterduelcounter.com/archetype/73/instance/15?type=deck"
```

Debe aparecer:

- `X-Guide-OG-Preview: hit`

Luego verifica metatags:

```bash
curl -A "Discordbot/2.0" "https://www.masterduelcounter.com/archetype/73/instance/15?type=deck" | grep -E "og:title|og:description|og:image|twitter:title"
```

## 7) Si algo sale mal (rollback rápido)

1. Restaurar config desde backup o deshacer el bloque agregado.
2. Validar:

```bash
sudo nginx -t
```

3. Recargar:

```bash
sudo systemctl reload nginx
```

## Checklist corto

- [ ] `location` agregado solo para `/archetype/:id/instance/:id`
- [ ] `nginx -t` OK
- [ ] reload sin errores
- [ ] header `X-Guide-OG-Preview: hit` presente
- [ ] Discordbot ve tags `og:*`
