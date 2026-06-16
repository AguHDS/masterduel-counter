api key opengo: sk-1b9U4QacncuLPN634YoZwgBQTCHbRywqKFhkRBP2TwImHuKdvXuJtUHogA3LJ8Gd

prompt inicial:
Tengo una web sobre yugioh donde usuarios pueden crear sus guias (de tipo counter guide o deck guide)
Lee el archivo .docs\memory.md (en la raiz del proyecto) para tener un buen contexto del proyecto

---

agregar seccion "Meta decks momento" que muestre los tier 1, 2 y 3 y te lleve a la seccion de guias.

---

- Seccion "Most effective cards in current meta" que muestre cartas handtrap tipo droll, fuwalos, etc..."
- en la stats de homepage, opcion para ordenar tambien por ultimos 30 dias

---

resolver problema de seguridad en VPS:
ejecutar Node.js como root es un riesgo de seguridad. Te recomendaría (después de que funcione todo):

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

en la guias del lista de perfil, hacer borders y background azul para guias deck y rojo para counter o algo que diga que tipo de guia es

---

Solo he puesto rate limiter al login y reporte, porque me daba problemas cuando le ponia rate limiter a cosas como visitas en las guias y cosas repetitivas. Si es riesgoso no hacerlo fijarse de implementarlo cuidadosamente en cada operacion que sea un target facil de ataques.

---

frontend\src\lib\http\guideInstancesApi.ts aca hay algunos metodos mal ubicados, deberian ser parte de la respectiva feature que lo relaciona....

---

panel de adminimplementar un sistema que permita poner mensajes ed que va a haber mantenimiento

---

crear .mds explicando cosas clave quew no recordaria de las features,c mo las request por ejemplo, que tienen 24 hs para compeltarse, o las guias guardadas como draft a partir de una request, etc

---

las notifications no se borran y han pasado 3 dias ya desde que estan mark as read, chequear cuanto es el timepo de limpieza, y si el cron job esta bien hecho.

---

mejoras:
- en Generalstats, mejorarlo con lazy loading (scroll infinito optimizado, no solo 15 items) y un search compartido. Ademas mejorar el diseño ya que tambien tenemos que agregar "total guides". Pensar en un diseño apropiado para un container como este que muestra la cantidad de guias counter/deck y metadata.

bugs:
resolviendo:
Necesitamos una nueva tab en el panel de admin para borar/agregar, arquetipos cmo habiamos dicho mas abajo.
- poner metadata Counter: N Deck: N en cada item de la tierlist
- En la tierlist, en el caso de Gem-Knights y HERO, no tienen imagenes y es por esta razon:
Al clickear esos items, dice "Archetype not found". Con respecto a HERO, es porque el item aparece como HEROS, pero en mi app el arquetipo se llama HERO. Fijarse que hacer en este caso.
- El arquetipo Gem-Knights, no existe en mi app, por que? quiza no se descargo de ygoprodeck? o no lo tienen a ese arquetipo?
- Funcionalidad para eliminar de mi app un arquetipo especifico, porque por ejemplo el arquetipo HERO tiene varias variantes de arquetipos: Destiny Hero, Evil Hero, etc... Solo deberia haber un arquetipo y sus variantes no debrian ser otras instancias de este.
Quiza, con una funcionalidad de remover arquetipos especificos desde el admin pannel, pueda solucionar este problema, y extendiendo esta funcionalidad para agregar arquetipos, puedo agregar el que falta y solucionar el problema de Gem-Knights.
Nota: He corrido el comando npm run populate-archetypes pero aun asi no agrega los faltantes. O el script esta mal, o por alguna razon la api de ygoprodeck no me consigue este arquetipo.
- Agregar un info help de como funciona el scrapper y manual de la tierlist, y el sistema de scrapping en el admin panel asi los admins saben como editar la tierlist en el admin pannel. Debe ser una explicacion breve y directa, ya que no es demasiada informaicon.
- Una vez funcione todo bien, agregar tierlist TCG y OCG. El titulo Tierlist debe cambiar dinamicamente a Tierlist Masterduel/TCG/OCG dependiendo de cual este seleccionada. Por default es Masterduel 