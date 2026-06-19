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
La ultima vez, estabamos resolviendo esta task pero me quede sin quota, asi que se corto justo cuando estabas revisando los lints del frontend y backend.
Mi duda es, has terminado esta implementacion? He resuelto personalmente errores de build relacionado a tipos. Fijate si esta ya terminada la implementacion completa.

- Problemas en el layout de pendulum. Esta mal funcionando. Los 6 placeholders se ven todos pegados en vista desktop. Deberian ser mas pequeños. Y en vista mobile esta demasiado roto, inusable.
Ademas en algunas resoluciones los placeholders del medio se empiezan a superponer con el de la derecha scale.
Tenes que editar bien el layout, porque parece que no lo adaptaste para que este listo para funcionar bien con este modo de pendulum.
Ademas, los placeholders de los costados scale deberian estar posicionados en el centro (mas al bottom), y su label scale justo arriba de ellos.
Otro problema grave, cuando selecciono una carta en uno de los 6 placeholders del medio, desaparecen los demas placeholders. Es como que esta asumiendo que solo se puede elegir una carta en el medio como si fuera una main card del modo NORMAL, pero te explique literalmente que necesitamos 6 placeholders para poner un maximo de 6 cartas si se quiere, no obligatoriamente una.
Encima, cada scale de los costados admite hasta un maximo de 5 cartas, esto esta MAL. los scale de los costados son una carta individual, no mas de una por scale. Los placeholders del medio deben permitir un maximo de 6 cartas.

Ademas, al guardar la guia, no se guarda con el layout de pendulo, se guarda como si fuera un step normal de los que siempre hubo.
Otro problema, el option para darle un numero al scale debe estar por encima de la carta como hace el "Chain?". Copiale su forma de funcionar. Y el numero del scale debe aparecer encima de la carta igual que lo hace el chain number.

- Preguntar si deberiamos crear tests por haber agregado el pendulum a los combo steps. Mostrar los tests de las guias frontend y backend

- Mi tierlist de masterduel tiene 2 entries de mas, Ryzeal Mitsurugi y R.B. , esas 2 estan en OCG y TCG pero no deberian estar en masterduel.
