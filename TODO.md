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
Mi duda es, has terminado esta implementacion?:

Perfecto, ahora vamos a mejorar las guias tipo DECK. Es agregar una mejora no muy compleja pero necesaria.
Los steps de la guia tipo deck, necesitan un boton que diga "Pend summon" cuando se esta en modo edicion. Este boton debe estar ubicado al extremo derecho en el mismo nivel que el boton "Canceled?" de cada step.

Que va a hacer al clickearlo? Va a transformar ese step para tener otra estructura:
- En lugar de tener una main card al medio, y 5 placeholders para los sidecards a la derecha e izquierda, va a tener un placeholder en la izquierda y un placeholder en la derecha para poner cartas.
- El label "Material" en el lazo izquierdo pasa a decir "Scale", y el label "Effect" pasa a decir "Scale".
- Ademas, las cartas de la izquierda y derecha seleccionadas van a tener numeros del 1 al 15 para elegir (el de la izquierda azul y el de la derecha rojo) que al elegir un numero, va a mostrarse en el bottom-centro de esa carta seleccionada
- En el medio, en vez de tener la main card, va a tener 6 placeholders para poner cartas.Estos 6 placeholders en el medio deben estar ubicados tres arriba y tres abajo en estructura, y cuando el width de pantalla sea muy chico deben ubicarse dos como mucho antes de hacer salto de linea. Respeta la responsibidad para dispositivos pequeños

Una vez publicada la guia, en modo view se debe ver bien como step de pendulo.

Archivos relacionados:
frontend\src\features\guide-editor\components\deck-guides\combo-step-editor\ComboStepItemEditor.tsx
frontend\src\features\guide-editor\components\deck-guides\combo-step-editor\ComboStepEditor.tsx
frontend\src\features\guide-editor\components\deck-guides\combo-step-editor\ComboStepCard.tsx
frontend\src\features\guide-editor\components\deck-guides\combo-step-editor\ComboStepCardSlot.tsx
frontend\src\features\guide-editor\components\deck-guides\combo-step-editor\ComboStepSideColumn.tsx
frontend\src\features\guide-editor\components\deck-guides\combo-step-editor\ComboFlowViewer.tsx
frontend\src\features\guide-editor\components\deck-guides\combo-step-editor\ComboFlowSection.tsx
frontend\src\features\guide-editor\hooks\deck-guides\useDeckGuideHandlers.ts
frontend\src\features\guide-editor\components\GuideContainer.tsx
frontend\src\features\guide-editor\hooks\useGuideDataSync.ts
frontend\src\features\guide-editor\hooks\useSaveInstanceGuide.ts
frontend\src\features\guide-editor\utils\comboStepEditorUtils.ts
frontend\src\features\guide-editor\utils\guideContainerTransforms.ts
frontend\src\features\guide-editor\utils\idGeneration.ts
frontend\src\features\guide-editor\utils\serialization.ts
frontend\src\features\guide-editor\utils\validation.ts
frontend\src\features\guide-editor\api\guideEditorApi.ts

En cuanto al backend, ve indagando desde los controllers para ver sus capas de dominio, application, infraestructura, composition root, etc.
backend\src\http\controllers\guides\registerGuideViewController.ts
backend\src\http\controllers\guides\getComboStepsController.ts

backend\src\http\controllers\guides\saveDraftController.ts -> quiza las guias guardadas como draft y su flujo hay que tener en cuenta tambien? no estoy seguro.

- Preguntar si deberiamos crear tests por haber agregado el pendulum a los combo steps. Mostrar los tests de las guias frontend y backend

- Mi tierlist de masterduel tiene 2 entries de mas, Ryzeal Mitsurugi y R.B. , esas 2 estan en OCG y TCG pero no deberian estar en masterduel.