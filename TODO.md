api key opengo: sk-1b9U4QacncuLPN634YoZwgBQTCHbRywqKFhkRBP2TwImHuKdvXuJtUHogA3LJ8Gd
MiniMax M3 → PLAN
MiMo V2.5 → BUILD
cosas muy importantes: deepseek v4 flash

prompt inicial:
Tengo una web sobre yugioh donde usuarios pueden crear sus guias (de tipo counter guide o deck guide)
Lee el archivo .docs\memory.md (en la raiz del proyecto) para tener un buen contexto del proyecto

---

- Seccion "Most effective cards in current meta" que muestre cartas handtrap tipo droll, fuwalos, etc..."
- en la stats de homepage, opcion para ordenar tambien por ultimos 30 dias

---

resolver problema de seguridad en VPS:
ejecutar Node.js como root es un riesgo de seguridad. Fijarse como hacer la buena practica sin tener que reconfigurar nada

Crear un usuario dedicado
Cambiar el owner de los archivos
Reiniciar pm2 con ese usuario

# Crear usuario sin privilegios

useradd -r -s /bin/false masterduel

# Cambiar owner de archivos

chown -R masterduel:masterduel /var/www/masterduel-counter

# Reiniciar pm2 con ese usuario

pm2 delete masterduel-backend
pm2 start dist/index.js --name masterduel-backend --user masterduel
Chequear si esto es todo lo que hay que hacer y si puedo llegar a tener probelmas como romper cosas, que algo deje de funcionar, duplicar cosas que no quiero duplicar, etc.

---

es raro que en el perfil se haga busqueda de cartas como en las guias pero no esten reutilizando la misma busqueda de cartas, no? chequear esto

---

Prisma mejora:
Cambiar nombres como ArchetypeInstance a GuideInstance, y cosas que tengan sentido si tienen que ver con las guias, tener cuidado porque se pueden perder los datos de produccion si se ejecuta el comando erroneo.
Hacerlo con la ayuda de un agente y pedirle que no ejecute el comandos para que no crashee vscode, decirle que me diga paso a paso que hacer

---

- Centralizar las peticiones http de las rutas. Mirar ejemplos como backend\src\routes\registerArchetype.ts.
Asi evitamos crear archivos de rutas multiples para una misma api. Chequea ruta por ruta.

---

Evaluar si los useCallbacks estan bien usados. Estan optimizacion y evitando problemas correctamente? o estan siendo usados innecesariamente lo cual hace que el codigo sea mas complejo y gaste recursos sin necesidad? evaluar casos

---

frontend\src\lib\http\guideInstancesApi.ts aca hay algunos metodos mal ubicados, deberian ser parte de la respectiva feature que lo relaciona....

---

panel de adminimplementar un sistema que permita poner mensajes ed que va a haber mantenimiento

---

crear .mds explicando cosas clave que no recordaria de las features,c mo las request por ejemplo, que tienen 24 hs para compeltarse, o las guias guardadas como draft a partir de una request, etc

---

las notifications no se borran y han pasado 3 dias ya desde que estan mark as read, chequear cuanto es el timepo de limpieza, y si el cron job esta bien hecho.

---

mejoras
- Migraciones de la base de datos para no perder datos
- Migracion de proyecto con estrategias devops (terraform y docker). Tener en cuenta que, al hacer esto probablemente tengamos que cambiar/modificar la feature que maneja los scripts de server management y hace restart con pm2 en el admin pannel, porque si usamos pm2 para restart eso no existiria en docker
- Generalstats deberia tener otro diseño, quiza mas informativo?
- Agregar seccion de Top Cards quiza en la misma tab de cartas, que muestra el % usage de las handtraps y boardbreakers. Tomar este dato de https://www.masterduelmeta.com/top-cards#usage-rate, pero tengo que hacer un sistmea que desde el admin panel me deje ingresar las cartas especificas que quiero que aparezcan en esa tierlist de cartas, ya que en https://www.masterduelmeta.com/top-cards#usage-rate muestra un % usage de TODAS las cartas, y yo quiero % de handtraps/boardbreakers. Tienen que quedar permanente las que yo ingreso como entry.
Aca tambien tenemos datos mas completos (tcg, masterduel, ocg):
https://ygoprodeck.com/top/
Podriamos poner esa feature a la vista en la home justo abajo de las request o arriba de ella
- implementar ban temporal y por ip
- pedir un diagrama de todo mi sistema, desde proyecto, hasta cosas devops y demas para mostrar a un entrevistador

bugs:

resolviendo:
- Agregar backup? como se hace? es un cron que reemplaza un archivo en prod? o que?
- Agregar rollback? que es?