# Al modificar el esquema:

## Desarrollo (local):
1. Editar `backend/prisma/schema.prisma`
2. `npx prisma migrate dev --name descripcion_del_cambio`
   - Genera la migración SQL y la aplica a la DB local
   - Corre `prisma generate` automáticamente
   - NUNCA aceptes "reset database" si Prisma detecta drift: investigar primero

## Producción (VPS):
- Se aplica automáticamente en cada deploy via GitHub Actions (`npx prisma migrate deploy`)
- NO correr `npx prisma migrate dev` en producción
- NO correr `npx prisma db push` en producción

```

**En CADA cambio de esquema**, además del `migrate dev` de desarrollo, aplicar la migración a `test.db`:
```powershell
$env:DATABASE_URL="file:./src/data/test.db"; npx prisma migrate deploy
```

> de `test.db` es solo una vez, NO se repite.

## Verificar estado de migraciones:
`npx prisma migrate status`

---

La diferencia práctica con el flujo viejo (`db push`): ahora `schema.prisma` sigue siendo la fuente de
verdad, pero cada cambio se registra como una **migración** con historial en `prisma/migrations/`, y el
deploy aplica las migraciones pendientes con `prisma migrate deploy` en lugar de sincronizar a ciegas.
`prisma db push` ya NO se usa.

# Comandos

Interfaz visuaL:
`npx prisma studio`

▶️ arrancar SQLite (abrir una DB) 
sqlite3 backend/prisma/src/data/database.db > `sqlite3 database.db`

▶️ ver todas las tablas
`.tables`

▶️ ver estructura de una tabla
`.schema nombre`

▶️ ver datos de una tabla
`SELECT * FROM nombre;`
salida mas legible:
`.headers on`
`.mode column`
`SELECT * FROM archetypes LIMIT 10;`

▶️ limpiar datos de una tabla (mantiene la tabla)
`DELETE FROM nombre_tabla;`
(Opción destructiva: borrar el archivo .db)

▶️resetear autoincrement
`DELETE FROM sqlite_sequence WHERE name='nombre_tabla';`

▶️ apagar SQLite (salir)
`.quit`

Nota:
**Todos los comandos SQL se ejecutan dentro del prompt sqlite>, luego de abrir la DB con sqlite3**

---

VPS:
sqlite3 prisma/src/data/database.db

-----------

