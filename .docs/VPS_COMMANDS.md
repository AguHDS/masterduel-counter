Conectarme al vps
- ssh root@142.93.66.243 

root pass: project-TON618a

Directorio del repo
- cd /var/www/masterduel-counter

Rebuildear backend:
cd /var/www/masterduel-counter/backend

npm run build

pm2 restart masterduel-backend 

systemctl reload nginx

---

reset db:
pm2 stop all
cd /var/www/masterduel-counter/backend/prisma/src/data
rm database.db
cd /var/www/masterduel-counter/backend
npx prisma migrate deploy
pm2 restart masterduel-backend

----------


COMANDOS ÚTILES PARA MÁS TARDE
Ver logs del backend:
pm2 logs masterduel-backend

Reiniciar backend:
pm2 restart masterduel-backend

Ver status del backend:
pm2 status

Reiniciar nginx:
systemctl restart nginx

Ver logs de nginx:
tail -f /var/log/nginx/error.log

Actualizar código después de hacer cambios:
cd /var/www/masterduel-counter
git pull
cd backend
npm run build
pm2 restart masterduel-backend
cd ../frontend
npm run build
systemctl reload nginx