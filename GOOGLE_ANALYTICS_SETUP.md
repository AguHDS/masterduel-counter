### Paso 3: Revisar Filtros de Datos

**ESTO ES CRÍTICO** - Los filtros pueden estar bloqueando datos.

1. En **Admin** → **Property** → **Data Settings** → **Data Filters**
2. **Revisa todos los filtros activos**

**Problema común:**
- Si ves un filtro llamado **"Internal Traffic"** marcado como **"Active"**
- Este filtro EXCLUYE permanentemente las IPs que considera "internas" (como tu IP de Argentina)
- Esto puede estar bloqueando TODOS los datos si la configuración es incorrecta

**Configuración recomendada:**
- Cambia **Filter State** a **"Testing"**
- En modo "Testing", el filtro NO excluye datos, solo los marca
- Esto te permite ver TODOS los usuarios (incluidos los de Argentina y otros países)

**¿Qué hace cada modo?**

| Modo | ¿Excluye datos? | ¿Cuándo usar? |
|------|----------------|---------------|
| **Testing** ✅ | NO - Guarda todo, solo marca | Recomendado: Ver todos los datos y poder filtrarlos manualmente después si quieres |
| **Active** ⚠️ | SÍ - Excluye permanentemente | Solo si estás 100% seguro de que quieres excluir tu propio tráfico para siempre |
| **Inactive** | NO - El filtro está apagado | Si no quieres ningún filtro |

**Recomendación final:**
- Deja el filtro en **"Testing"** PERMANENTEMENTE
- No es una solución "temporal", es una configuración válida
- Así verás el total real de usuarios y podrás filtrar después si quieres

---

### Paso 6: Verificar que NO haya Filtros de Vista (Views)

**IMPORTANTE**: GA4 no usa "Views" como Universal Analytics, pero si migraste desde UA, puede haber configuraciones heredadas.

1. Busca si hay **Audience** filters o **Segments** activos que excluyan tráfico
2. En **Admin** → **Property** → **Audiences**, verifica que no haya audiencias que excluyan países

---

## 🧪 PROBAR LA CONFIGURACIÓN

### Después de desplegar a producción:

1. **Abre Chrome en modo incógnito** (sin extensiones)
2. Ve a https://masterduelcounter.com
3. **Abre la consola del navegador** (F12 → Console)
4. Deberías ver:
   ```
   [GA] Initialized with ID: G-P57LFNSW84
   [GA] Page view tracked: /
   ```
5. **Navega a otra ruta** (ej: un archetype)
6. Deberías ver:
   ```
   [GA] Page view tracked: /archetype/123
   ```

### Verificar en Google Analytics Realtime:

1. Ve a https://analytics.google.com/
2. En el menú izquierdo: **Reports** → **Realtime** → **Overview**
3. Deberías ver:
   - **Users in last 30 minutes**: tu sesión activa
   - **Views by Page title and screen name**: las páginas que visitaste
   - **Event count by Event name**: eventos `page_view`, `first_visit`, `session_start`

---

## 👥 PROBAR CON AMIGOS DE OTROS PAÍSES

**Pide a tus amigos que:**

### 1. Usen un navegador sin bloqueadores
- ❌ NO usar navegadores con bloqueadores por defecto (Brave, DuckDuckGo)
- ❌ NO usar extensiones: AdBlock, uBlock Origin, Privacy Badger, Ghostery
- ✅ Usar Chrome, Edge o Firefox **en modo normal** (no incógnito en este caso)
- ✅ Desactivar VPN si tienen una activa

### 2. Naveguen por al menos 3 páginas
- Homepage
- Un archetype
- Un profile u otra sección

### 3. Permanezcan al menos 30 segundos en el sitio

### 4. Verifica en Realtime
- Deberías ver el contador de usuarios en **Realtime** subir
- Deberías ver múltiples **page_view** events
- En **Users by country**, deberías ver los países de tus amigos

---

## 🚫 CAUSAS COMUNES DE NO TRACKING

### 1. Bloqueadores de anuncios
**Síntoma**: No se ve ningún tracking  
**Solución**: Deshabilitar AdBlock, uBlock Origin, etc.

### 2. Navegadores con privacidad estricta
**Síntoma**: Tracking inconsistente  
**Navegadores problemáticos**:
- Brave (bloquea por defecto)
- Safari con "Prevent Cross-Site Tracking" activo
- Firefox con "Enhanced Tracking Protection" en modo estricto

**Solución**: Pedir que usen Chrome o Edge sin extensiones

### 3. VPN o proxies
**Síntoma**: Usuario aparece desde país incorrecto o no aparece  
**Solución**: Desactivar VPN temporalmente para probar

### 4. DNS personalizados que bloquean tracking
**Síntoma**: Scripts de GA no cargan  
**Ejemplo**: NextDNS, Pi-hole, AdGuard DNS  
**Solución**: Usar DNS del ISP por defecto

### 5. Configuración de red corporativa
**Síntoma**: No tracking desde redes de oficina  
**Solución**: Probar desde conexión doméstica o móvil

### 6. JavaScript deshabilitado
**Síntoma**: Sitio no funciona correctamente  
**Solución**: Habilitar JavaScript en el navegador

---

## 📊 REVISAR REPORTES CORRECTOS

No uses solo **Realtime**. Los reportes principales tienen latencia de hasta 24-48 horas.

### Para ver usuarios totales e históricos:

1. **Reports** → **Life cycle** → **Acquisition** → **User acquisition**
   - Ver de dónde vienen los usuarios (Organic Search, Direct, etc.)
   - Ver por país

2. **Reports** → **Life cycle** → **Engagement** → **Pages and screens**
   - Ver qué páginas son más visitadas
   - Ver tiempo promedio en cada página

3. **Reports** → **User** → **User attributes** → **Overview**
   - Ver distribución geográfica
   - Ver idiomas de navegador

4. **Reports** → **Life cycle** → **Engagement** → **Events**
   - Ver todos los eventos: `page_view`, `session_start`, `first_visit`

---

## ⏱️ LATENCIA DE DATOS

- **Realtime**: Datos en 30-60 segundos ✅
- **Reportes estándar**: 24-48 horas ⚠️
- Algunos reportes pueden tardar hasta **72 horas** en poblarse completamente

**Si después de 48 horas de tráfico real no ves datos:**
→ Revisa los **Data Filters** (Paso 3)

---

## 🔧 TROUBLESHOOTING AVANZADO

### Verificar que el script carga correctamente:

1. Abre tu sitio en producción
2. Abre DevTools (F12)
3. Ve a **Network** tab
4. Filtra por "gtag" o "google-analytics"
5. Deberías ver:
   - ✅ `gtag/js?id=G-P57LFNSW84` - Status 200
   - ✅ Requests a `google-analytics.com/g/collect` - Status 200 o 204

**Si ves errores 403 o blocked:**
- Hay un bloqueador activo (extensión o firewall)

### Verificar cookies:

1. En tu sitio, abre DevTools → **Application** → **Cookies**
2. Deberías ver cookies de Google Analytics:
   - `_ga`
   - `_ga_XXXXXXXXXX` (donde X es tu container ID)

**Si no hay cookies:**
- El navegador está bloqueando third-party cookies
- O el script de GA no se ejecutó correctamente

---

## 📞 SIGUIENTE PASO

1. **Despliega estos cambios a producción**
2. **Verifica en la consola del navegador** que ves los logs `[GA] ...`
3. **Revisa los pasos de configuración en GA** (especialmente Data Filters)
4. **Prueba con un amigo en otro país** usando Chrome sin extensiones
5. **Espera 30-60 segundos** y verifica en Realtime
6. **Si sigue sin funcionar**, comparte:
   - Screenshot de tu Data Stream configuration
   - Screenshot de tus Data Filters
   - Screenshot de la consola del navegador mostrando los logs de G