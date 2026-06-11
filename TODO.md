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

al cancelar en el perfil la edicion, la favorite card no limpia su estado.

---

Prisma mejora:
Cambiar nombres como ArchetypeInstance a GuideInstance, y cosas que tengan sentido si tienen que ver con las guias, tener cuidado porque se pueden perder los datos de produccion si se ejecuta el comando erroneo.
Hacerlo con la ayuda de un agente y pedirle que no ejecute el comandos para que no crashee vscode, decirle que me diga paso a paso que hacer

---

- Centralizar las peticiones http de las rutas. Mirar ejemplos como backend\src\routes\registerArchetype.ts.
Asi evitamos crear archivos de rutas multiples para una misma api. Chequea ruta por ruta.

---

cuando se usa el search de cartas el tooltip al hacer hover se ve lagero, hay que evitar eso. Es como que trata de acomodar la posicion y eso lagea.

---

Evaluar si los useCallbacks estan bien usados. Estan optimizacion y evitando problemas correctamente? o estan siendo usados innecesariamente lo cual hace que el codigo sea mas complejo y gaste recursos sin necesidad? evaluar casos

---

en la guias del lista de perfil, hacer borders y background azul para guias deck y rojo para counter o algo que diga que tipo de guia es

---

copiar la tierlist como la hacen en el honkai

---

El badge en las guias se superpone con el titulo de la Guia....

---
Solo he puesto rate limiter al login y reporte, porque me daba problemas cuando le ponia rate limiter a cosas como visitas en las guias y cosas repetitivas. Si es riesgoso no hacerlo fijarse de implementarlo cuidadosamente en cada operacion que sea un target facil de ataques.

---

frontend\src\lib\http\guideInstancesApi.ts aca hay algunos metodos mal ubicados, deberian ser parte de la respectiva feature que lo relaciona....

---

panel de adminimplementar un sistema que permita poner mensajes ed que va a haber mantenimiento

---

Refactorizar las features que no esten teniendo buenas practicas. Por ejemplo la feature de profile, la pagina de ProfilePage deberia separarse por responsabildiades. Deberia tener objetos en la carpeta type (interfaces/types bien definidos) representando las partes importantes del perfil para facilitar tests, etc.

---

tests

---

crear .mds explicando cosas clave quew no recordaria de las features,c mo las request por ejemplo,, que tienen 24 hs para compeltarse, o las guias guardadas como draft a partir de una request, etc

---

las notifications no se borran y han pasado 3 dias ya desde que estan mark as read, chequear cuanto es el timepo de limpieza para dar un diagnostico, y si el cron job esta bien hecho.

---

mejoras:
- En el perfil, lo relacionado a los personal decks no esta responsive, creo que se rompio cuando tocamos cosas del recommended deck. ASegurarse que sea responsive sin romper el otro.
- Cuando cancelamos una take en el modal de requests, el render no refleja que se cancelo correctamente. Sigue mmostrando el boton de Cancel my take. Deberia de volver a mostrar el boton de Take this request. Esto es un bug visual (porque en realidad si se cancela si refrescas la pagina).
- Mostrar nivel de carta en numero en tooltip.
Las cartas en posición de defensa deben renderizarse con una rotación de -90° (sentido antihorario).
- agregar title al perfil, ahora dice la url en la pestaña de navegador.

- En reddit un usuario me dijo que el comboflow tiene espacio muerto, ver como arreglar esto, fijarse el chat.
- en Generalstats, mejorarlo con lazy loading (scroll infinito optimizado, no solo 15 items) y un search compartido. Ademas mejorar el diseño ya que tambien tenemos que agregar "total guides". Pensar en un diseño apropiado para un container como este que muestra la cantidad de guias counter/deck y metadata.
- en la lista de Guias y Favorites del perfil, tambien ordenar por views,likes. Updated (mas reciente, primero) debe ser default y creo que ya lo tiene puesto asi.

bugs:
- si modifico la carta favorita, se guarda incluso si cancelo, limpiar bien los estados de edicion
- Si busco arquetipos y los selecciono en la search principal, a veces no muestra el resultado del ultimo buscado
- Si clickeo el boton De Support Us se re-renderea 2 veces y me scrollea arriba de todo de la homepage.
- si edito la endboard de una initial hand que fue copiada, se edita la original.

Resolviendo:
