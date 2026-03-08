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

## Verificar nginx
# Verificar sintaxis
sudo nginx -t
# Ver configuración completa
sudo nginx -T
`Nota: Acordarse de permitir hasta 3MB como max en la cfg de nginx para evitar errores 413 Payload Too Large`

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

--------------

## Monitorear uso de memoria VPS
free -h -> Ver uso de memoria RAM y swap
htop -> Ver uso de CPU, memoria y procesos en tiempo real