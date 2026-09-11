# Rate Limiting

## Resumen

La app usa `express-rate-limit` con patrón **sliding window**. No hay límites fijos por hora — se mide cualquier ventana de X minutos hacia atrás.

## Límites actuales

| Endpoint | Método | Límite | Ventana |
|----------|--------|--------|---------|
| `/api/auth` (login) | POST/PUT/DELETE | **30** | 15 min |
| `/api/reports` (anónimo) | POST/PUT/DELETE | 20 | 1 hora |
| `/api/reports` (autenticado) | POST/PUT/DELETE | 50 | 1 hora |
| **General write** (anónimo) | POST/PUT/DELETE | 30 | 1 hora |
| **General write** (autenticado) | POST/PUT/DELETE | **600** | **2 horas** |

## Endpoints cubiertos por General Write

- `/api/archetypes/*` — creación/edición de guías
- `/api/comments/*` — comentarios
- `/api/profile/*` — edición de perfil, bio
- `/api/cards/*` — confirmación de cartas, selección
- `/api/custom-decks/*` — decks personalizados
- `/api/guide-requests/*` — solicitudes de guías
- `/api/tier-list/*` — operaciones de escritura (save, scrape, config, reorder)

## Lo que NO tiene rate limit

- **GET en general** — Google, usuarios, lecturas. Sin restricción.
- **Static files** (frontend dist) — servidos por Nginx, no pasan por Express.
- **Imágenes de cartas** — servidas por Nginx directamente desde `uploads/`.

## Cómo testear que no rompió nada

### 1. Login debe funcionar normalmente

```bash
# Hasta 30 intentos rápidos no deben fallar
for i in $(seq 1 25); do
  curl -X POST https://masterduelcounter.com/api/auth/login \
    -d '{"user":"testuser","password":"wrong"}' \
    -H "Content-Type: application/json" -w "\n" -s | grep -q "success.*false"
done
echo "Login test done"
```

### 2. Creación de guías de usuario autenticado

- Iniciar sesión en el navegador
- Crear una guía completa con múltiples combos y muchas cartas confirmadas
- Verificar que ninguna request falle con 429 "Too many requests"

### 3. Googlebot no debe ser bloqueado

```bash
# Simular Googlebot en GET /tierlist — debe responder 200 sin rate limit
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  https://masterduelcounter.com/tierlist -o /dev/null -w "%{http_code}" -s
# Debe dar 200
```

### 4. Sitemap debe funcionar

```bash
curl https://masterduelcounter.com/sitemap.xml -o /dev/null -w "%{http_code}" -s
# Debe dar 200
```

## Cómo identificar si el rate limit está bloqueando

- La API devuelve `429 Too Many Requests` con body `{ success: false, error: "Too many requests", message: "..." }`
- El frontend (axiosClient) tiene un `errorInterceptor` que maneja esto
- Si ves estos errores en producción sin motivo aparente, los límites son demasiado bajos

## Notas

- El rate limiter usa **sliding window**: en cualquier momento, mirando hacia atrás la ventana, no se pueden superar N requests
- El key del rate limiter es `user:userId` para autenticados, `ip:IP` para anónimos
- En modo test (`NODE_ENV=test`) los rate limiters se deshabilitan automáticamente (vitest los salta)
- Googlebot solo hace GET — nunca es afectado por estos límites
