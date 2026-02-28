# Guía de Deployment - Master Duel Counter

## Servicios y Herramientas

### **Hetzner** (Cloud VPS + Dominio)
- **¿Qué es?** Proveedor de servidores VPS (Virtual Private Server). NO ofrece base de datos como servicio
- **¿Qué necesitas?** 
  - VPS (Cloud Server) - Desde €4.15/mes (CX22: 2 vCPU, 4GB RAM)
  - Dominio - Se compra **por separado** (€10-20/año aprox)
- **No necesitas BD externa:** SQLite es embebida, va en el VPS
- **Panel administrativo:** Hetzner Cloud Console (web) para gestionar VPS y DNS

### **Cloudinary** (Storage de imágenes)
- Plan gratuito: 25 créditos/mes (suficiente para empezar)
- Ya configurado en tu código

### **Brevo** (Emails transaccionales)
- Plan gratuito: 300 emails/día
- Para verificación de email y password recovery

### **Sentry** (Error tracking)
- Plan gratuito: 5K eventos/mes
- Ya integrado en tu frontend

### **Cloudflare Turnstile** (CAPTCHA)
- Gratuito ilimitado
- Controla bots en registro/login

---

## PASO 1: Pre-configuración de Servicios

### 1.1 Cloudinary
1. Crea cuenta en https://cloudinary.com
2. Ve a Dashboard → Copia: `Cloud Name`, `API Key`, `API Secret`

### 1.2 Brevo (SMTP)
1. Crea cuenta en https://brevo.com
2. Ve a **SMTP & API** → **SMTP**
3. Genera una clave SMTP → Guarda: `Login`, `Password`
4. Configura dominio verificado (o usa `smtp-relay.brevo.com` genérico)

### 1.3 Cloudflare Turnstile
1. Crea cuenta en https://dash.cloudflare.com
2. Ve a **Turnstile** → **Add Site**
3. Dominio: `masterduelcounter.com` (o tu dominio)
4. Guarda: `Site Key` (frontend) y `Secret Key` (backend)

### 1.4 Sentry (Opcional)
1. Crea cuenta en https://sentry.io
2. Crea proyecto React → Copia el **DSN**
3. Guarda para frontend `.env`

### 1.5 Discord OAuth
1. Ve a https://discord.com/developers/applications
2. Crea aplicación → OAuth2 → Copia `Client ID` y `Client Secret`
3. **Redirects (CRÍTICO):**
   - Desarrollo: `http://localhost:3001/api/auth/callback/discord`
   - Producción: `https://masterduelcounter.com/api/auth/callback/discord`

---

## PASO 2: Comprar y Configurar Hetzner

### 2.1 Crear Cuenta y Comprar VPS
1. Regístrate en https://www.hetzner.com
2. Ve a **Cloud** → **New Project** → Nombra tu proyecto
3. **Create Server:**
   - **Location:** Elige el más cercano a tu audiencia (ej: Falkenstein, Alemania para Europa)
   - **Image:** Ubuntu 24.04 LTS
   - **Type:** CPX21 (2 vCPU, 4GB RAM, 80GB disk) - €5.64/mes
   - **SSH Key:** Sigue instrucciones abajo para generar tu clave SSH
   - **Firewall:** Crear nuevo (ver paso 2.3)

### 2.2 Generar SSH Key desde Windows 11
Abre **PowerShell** y ejecuta:

```powershell
# Generar clave SSH (presiona Enter para aceptar ubicación por defecto)
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

cat $env:USERPROFILE\.ssh\id_ed25519.pub # Ver clave pública (copiar TODO el contenido)
```

Copia el output y pégalo en Hetzner al crear el servidor.

### 2.3 Configurar Firewall en Hetzner
En Hetzner Cloud Console → **Firewalls** → **Create Firewall:**

**Inbound Rules:**
- SSH: Port 22, Source `0.0.0.0/0` (mejor: solo tu IP para seguridad)
- HTTP: Port 80, Source `0.0.0.0/0`
- HTTPS: Port 443, Source `0.0.0.0/0`

### 2.4 Comprar Dominio
**Opciones:**
1. **Hetzner Domain Registration** (€10-15/año) - Más integrado
2. **Namecheap, Cloudflare, GoDaddy** - Más opciones y funciones

**Recomendación:** Cualquiera funciona. Si usas Hetzner, el DNS se configura automáticamente.

### 2.5 Configurar DNS
En **Hetzner DNS** (o tu registrar) → Añade estos registros:

```
Tipo: A
Nombre: @
Valor: [IP_DE_TU_VPS]
TTL: 3600

Tipo: A
Nombre: www
Valor: [IP_DE_TU_VPS]
TTL: 3600
```

**Propagación:** 1-48 horas (usualmente < 2 horas)

---

## PASO 3: Configurar el VPS (Primera vez)

### 3.1 Conectar al VPS desde Windows

```powershell
# Conectar vía SSH (reemplaza con tu IP)
ssh root@[IP_DE_TU_VPS]
```

### 3.2 Instalación Inicial en el VPS

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 22.x LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Instalar utilidades
apt install -y git build-essential python3 nginx certbot python3-certbot-nginx

# Verificar instalaciones
node -v  # v22.x
npm -v   # 10.x
git --version
nginx -v

# Configurar firewall UFW
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

### 3.3 Crear Usuario No-Root (Seguridad)

```bash
# Crear usuario 'deploy'
adduser deploy
usermod -aG sudo deploy

# Copiar SSH keys al nuevo usuario
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Salir y reconectar como 'deploy'
exit
```

Desde tu PowerShell:
```powershell
ssh deploy@[IP_DE_TU_VPS]
```

### 3.4 Clonar Repositorio

```bash
cd ~
git clone https://github.com/TU_USUARIO/masterduel-counter.git
cd masterduel-counter
```

**Si es privado:**
```bash
# Generar SSH key en el VPS
ssh-keygen -t ed25519 -C "vps@masterduelcounter.com"
cat ~/.ssh/id_ed25519.pub  # Copiar y añadir a GitHub → Settings → SSH Keys
```

### 3.5 Build del Proyecto

```bash
# Instalar dependencias backend
cd ~/masterduel-counter/backend
npm install

# Generar Prisma Client
npx prisma generate

# Build backend
npm run build

# Instalar dependencias frontend
cd ~/masterduel-counter/frontend
npm install

# Build frontend
npm run build
```

---

## PASO 4: Configurar Variables de Entorno

### 4.1 Backend `.env`

```bash
cd ~/masterduel-counter/backend
nano .env
```

Pega y **completa con tus valores reales:**

```env
PORT_FRONTEND=5173
PORT_BACKEND=3001

NODE_ENV=production
CORS_ORIGIN=https://masterduelcounter.com

JWT_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_SECRET=$(openssl rand -base64 32)

DATABASE_URL=file:./src/data/database.db

# Cloudinary (de PASO 1.1)
CLOUDINARY_NAME=tu_cloudinary_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Brevo SMTP (de PASO 1.2)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=tu_brevo_login
SMTP_PASSWORD=tu_brevo_password
SMTP_FROM_NAME=masterduelcounter
SMTP_FROM_EMAIL=noreply@masterduelcounter.com

REQUIRE_EMAIL_VERIFICATION=true

# Turnstile (de PASO 1.3)
TURNSTILE_SECRET_KEY=tu_secret_key

# Discord OAuth (de PASO 1.5)
DISCORD_CLIENT_ID=tu_client_id
DISCORD_CLIENT_SECRET=tu_client_secret
```

Guarda: `Ctrl + O`, `Enter`, `Ctrl + X`

### 4.2 Frontend `.env`

```bash
cd ~/masterduel-counter/frontend
nano .env
```

```env
VITE_CLOUDINARY_NAME=tu_cloudinary_name
VITE_QUERY_ENV=production
VITE_API_URL=https://masterduelcounter.com/api
VITE_TURNSTILE_SITE_KEY=tu_site_key
VITE_SENTRY_DSN=tu_sentry_dsn
```

Guarda: `Ctrl + O`, `Enter`, `Ctrl + X`

**IMPORTANTE:** Rebuild frontend después de cambiar `.env`:
```bash
cd ~/masterduel-counter/frontend
npm run build
```

---

## PASO 5: Configurar Nginx (Reverse Proxy)

### 5.1 Crear Configuración Nginx

```bash
sudo nano /etc/nginx/sites-available/masterduelcounter
```

Pega esta configuración:

```nginx
server {
    listen 80;
    server_name masterduelcounter.com www.masterduelcounter.com;

    # Frontend (archivos estáticos)
    location / {
        root /home/deploy/masterduel-counter/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts para BetterAuth
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Tamaño máximo de subida (para imagenes Cloudinary)
    client_max_body_size 10M;
}
```

### 5.2 Activar Sitio

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/masterduelcounter /etc/nginx/sites-enabled/

# Eliminar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

## PASO 6: Configurar SSL (HTTPS con Let's Encrypt)

```bash
# Obtener certificado SSL (reemplaza con tu email y dominio)
sudo certbot --nginx -d masterduelcounter.com -d www.masterduelcounter.com

# Seguir prompts:
# - Email: tu-email@ejemplo.com
# - Aceptar términos: Yes
# - Compartir email: No (opcional)
# - Redirect HTTP → HTTPS: Yes (opción 2)

# Verificar renovación automática
sudo certbot renew --dry-run
```

Certbot modifica automáticamente tu Nginx config para usar HTTPS.

---

## PASO 7: Configurar Backend como Servicio (PM2)

### 7.1 Instalar PM2

```bash
sudo npm install -g pm2
```

### 7.2 Iniciar Backend

```bash
cd ~/masterduel-counter/backend

# Iniciar con PM2
pm2 start npm --name "masterduel-backend" -- start

# Ver logs
pm2 logs masterduel-backend

# Ver status
pm2 status

# Auto-start en reboot
pm2 startup
pm2 save
```

---

## PASO 8: Inicializar Base de Datos

```bash
cd ~/masterduel-counter/backend

# Ejecutar migraciones Prisma
npx prisma migrate deploy

# Poblar arquetipos de Yu-Gi-Oh
npm run populate-archetypes

# (Opcional) Crear usuario admin
npm run create-admin
# Seguir prompts para crear admin
```

---

## PASO 9: Verificación Final

### 9.1 Checklist

- [ ] **DNS propagado:** `nslookup masterduelcounter.com` muestra IP correcta
- [ ] **HTTPS funcionando:** https://masterduelcounter.com carga sin errores
- [ ] **Backend responde:** https://masterduelcounter.com/api/health (si tienes endpoint)
- [ ] **Registro/Login funciona:** Prueba crear cuenta y login
- [ ] **Email verification:** Verifica que lleguen emails de Brevo
- [ ] **Turnstile funciona:** CAPTCHA se muestra correctamente
- [ ] **Discord OAuth:** Login con Discord funciona
- [ ] **Subir imagen funciona:** Cloudinary guarda imágenes correctamente
- [ ] **Guías se crean correctamente**

### 9.2 Ver Logs

```bash
# Logs backend (PM2)
pm2 logs masterduel-backend

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs sistema
sudo journalctl -u nginx -f
```

---

## Comandos Útiles para Mantenimiento

### Conectar al VPS
```powershell
# Desde PowerShell en Windows
ssh deploy@[IP_DE_TU_VPS]
```

### Actualizar Código (Deploy nuevas versiones)
```bash
cd ~/masterduel-counter

# Pull últimos cambios
git pull origin main

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart masterduel-backend

# Frontend
cd ../frontend
npm install
npm run build  # CRÍTICO: Rebuild si cambiaste .env
sudo systemctl reload nginx
```

### Scripts de Base de Datos
```bash
cd ~/masterduel-counter/backend

# Poblar arquetipos (actualizar desde API)
npm run populate-archetypes

# Limpiar cartas temporales
npm run cleanup-cards

# Crear admin
npm run create-admin

# Reset completo (¡CUIDADO! Borra todo)
npm run reset-db
```

### Gestión PM2
```bash
# Ver procesos
pm2 list

# Ver logs en tiempo real
pm2 logs masterduel-backend

# Reiniciar backend
pm2 restart masterduel-backend

# Detener backend
pm2 stop masterduel-backend

# Eliminar proceso
pm2 delete masterduel-backend

# Info detallada
pm2 info masterduel-backend
```

### Nginx
```bash
# Verificar configuración
sudo nginx -t

# Recargar (sin downtime)
sudo systemctl reload nginx

# Reiniciar
sudo systemctl restart nginx

# Ver status
sudo systemctl status nginx
```

### Renovar SSL (se hace automático, pero manual si falla)
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Backup Base de Datos
```bash
# Crear backup
cd ~/masterduel-counter/backend/src/data
cp database.db database.db.backup-$(date +%Y%m%d)

# Restaurar backup
cp database.db.backup-20260228 database.db
pm2 restart masterduel-backend
```

### Monitoreo de Recursos
```bash
# Ver uso de CPU/RAM
htop

# Ver espacio en disco
df -h

# Ver logs de sistema
sudo journalctl -xe
```

---

## Troubleshooting

### Emails no se envían
1. Verifica credenciales SMTP en backend `.env`
2. Chequea logs: `pm2 logs masterduel-backend`
3. Verifica quota de Brevo: https://app.brevo.com
4. SMTP port 587 debe estar abierto en firewall

### CAPTCHA no funciona
1. Verifica `VITE_TURNSTILE_SITE_KEY` en frontend `.env`
2. **Rebuild frontend** después de cambiar: `npm run build`
3. Dominio debe coincidir con Turnstile dashboard

### 502 Bad Gateway
1. Backend no está corriendo: `pm2 list`
2. Reinicia backend: `pm2 restart masterduel-backend`
3. Verifica puerto 3001: `netstat -tulpn | grep 3001`

### Discord OAuth falla
1. Verifica redirect URI en Discord Developer Portal:
   - `https://masterduelcounter.com/api/auth/callback/discord`
2. Verifica `DISCORD_CLIENT_ID` y `DISCORD_CLIENT_SECRET`
3. Chequea que `NODE_ENV=production` en backend `.env`

### Frontend no actualiza cambios
1. **SIEMPRE rebuild** después de cambios: `npm run build`
2. Hard refresh en navegador: `Ctrl + Shift + R`
3. Borra caché: `sudo systemctl reload nginx`

### Base de datos corrupta
1. Restaura backup: `cp database.db.backup-FECHA database.db`
2. Si no hay backup, usa: `npm run reset-db` (¡borra todo!)

---

## Costos Estimados Mensuales

| Servicio | Plan | Costo |
|----------|------|-------|
| Hetzner VPS (CPX21) | 2 vCPU, 4GB RAM | €5.64/mes |
| Dominio | .com | ~€1/mes (€12/año) |
| Cloudinary | Gratuito | €0 |
| Brevo | Gratuito | €0 |
| Sentry | Gratuito | €0 |
| Turnstile | Gratuito | €0 |
| **TOTAL** | | **~€6.64/mes** |

---

## Notas Importantes

1. **SQLite en Producción:** Es viable para tráfico bajo-medio. Si creces mucho, considera migrar a PostgreSQL
2. **Backups:** SQLite no tiene backup automático. Crea cronjob para backups diarios
3. **Hetzner Panel:** https://console.hetzner.cloud - Gestiona VPS, firewall, DNS, snapshots
4. **Dominio separado:** Hetzner no REQUIERE que compres el dominio con ellos, puedes usar cualquier registrar
5. **Windows 11 → VPS:** Usas PowerShell + SSH para conectar. El VPS corre Ubuntu (Linux)
6. **Better Auth SMTP:** Configurado en `backend/src/lib/auth.ts`, usa tu email `.env` config
