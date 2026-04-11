Interfaz visual:
`npx prisma studio`

▶️ arrancar SQLite (abrir una DB) 
backend/prisma/src/data/database.db > `sqlite3 database.db`

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

Cuando modificamos la DB:
npx prisma db push
npx prisma generate solo si querés forzarlo manualmente; normalmente db push ya ejecuta generators salvo que uses --skip-generate
reiniciar backend
La diferencia práctica es esta: schema.prisma es la fuente de verdad, y db push simplemente sincroniza la base con ese schema. migrate dev en cambio intenta crear y administrar historial de migraciones, que es justo lo que decís que no usás.