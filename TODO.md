api key opengo: sk-1b9U4QacncuLPN634YoZwgBQTCHbRywqKFhkRBP2TwImHuKdvXuJtUHogA3LJ8Gd

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

mejoras:
- en Generalstats, mejorarlo con lazy loading (scroll infinito optimizado, no solo 15 items) y un search compartido. Ademas mejorar el diseño ya que tambien tenemos que agregar "total guides". Pensar en un diseño apropiado para un container como este que muestra la cantidad de guias counter/deck y metadata.
- Agregar seccion de Top Cards quiza en la misma tab de cartas, que muestra el % usage de las handtraps y boardbreakers. Tomar este dato de https://www.masterduelmeta.com/top-cards#usage-rate, pero tengo que hacer un sistmea que desde el admin panel me deje ingresar las cartas especificas que quiero que aparezcan en esa tierlist de cartas, ya que en https://www.masterduelmeta.com/top-cards#usage-rate muestra un % usage de TODAS las cartas, y yo quiero % de handtraps/boardbreakers. Tienen que quedar permanente las que yo ingreso como entry.
Aca tambien tenemos datos mas completos (tcg, masterduel, ocg):
https://ygoprodeck.com/top/
Podriamos poner esa feature a la vista en la home justo abajo de las request o arriba de ella
- implementar ban temporal y por ip
- fijarse si el screenshot de los stats del trending de usuario se calcula correctamente para cad mes individual y no acarrea cosas del mes anterior. Hay un caso donde un usuario de este mes tiene 2 likes, pero en su unica guia que tiene solo tiene un like, esto es raro.
Aunque su guia fue publicada en junio, por que tiene 2 likes? ya probe sacar mi like a ver si seguia teniendo 2 en caso de que no se actualice correctamente el dato pero si se le quita 1 cuando le saco

bugs:

resolviendo:
