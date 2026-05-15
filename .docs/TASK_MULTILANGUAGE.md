problema: nuestra api no soporta los lenguajes que quiero usar.

- Hacer la web multiidioma, usar hreflang para que google no nos castigue el SEO por no gustarle traducciones automaticas. investigar bien que hacer y que cosas tener en cuenta para que nuestro SEO no se vea perjudicado por temas de traduccion (contenido duplicado mal entendido por google, traduccion automatica que a google no le gusta, etc).
Puede que necesitemos agregar "/en" en las urls, en ese caso, acordarse de la logica que tenemos que hacer cuando modificamos una url (antes trabajamos las redirecciones 301), fijarse esto bien para que no haya problemas.

prompt:
Tengo una web sobre yugioh donde usuarios pueden crear sus guias (de tipo counter guide o deck guide)
Lee el archivo .docs\memory.md (en la raiz del proyecto) para tener un buen contexto del proyecto

Que vamos a hacer?
- Hacer la web multiidioma. Mi web usa la api de https://db.ygoprodeck.com para conseguir las cartas. Lo que vamos a traducir a los nuevos idiomas va a ser el idioma de las cartas que trae nuestra api, es decir, solo vamos a cambiar el idioma de las cartas que se muestran en la web, y las que se buscan en el search de cartas. 
Importante: No vamos a traducir el contenido que he agregado manualmente a la web como titulos, cuerpo de paginas, etc, ya que eso implica usar etiquetas como hreflang para que mi SEO no se vea perjudicado, ademas de usar tecnicas convencionales para traducir la web manualmente, eso no lo vamos a hacer ahora, pero si debemos dejar nuestra implementacion preparada para poder extenderse a agregar esa funcionalidad en el futuro si me decido a agregarla.

- Pensar si esta nueva implementacion de cambio de idioma debe ser una nueva feature en frontend\src\features o si debe ir en una nueva carpeta /config en frontend\src, elegir la mejor opcion para la arquitectura.

- Investigar la api que estamos usando para traer las cartas (actualmente en ingles) y chequear si tiene una forma de conseguir las cartas para estos idiomas:
- Español
- Chino
- Japones
Si no tiene esos idiomas y no se puede, entonces no hacer nada y explicarme por que no se puede, de lo contrario ya tendriamos lo necesario para la implementacion.

- La opcion de cambio de idioma va a ir en la navbar como un boton llamado LAN(con icono del mundo usando react-lucide), con un menu desplegable al clickearlo que deja elegir los idiomas. Debe ir ubicado como a la derecha del icono de notifications de la navbar, y tendremos estas opciones:
English (defecto y actual)
Español (Spanish)
日本語 (Japanese)
中文 / 汉语 (Chinase)

- Asegurate de que no solo cambien de idioma el contenido de las cartas que nos trae la API que usamos, sino tambien que al usar nuestro modal de search de cartas, se pueda buscar las cartas en sus respectivos idiomas sin problemas.

- Al cambiar el idioma, refrescar la pagina asi tenemos los estados con el nuevo idioma frescos y limpios.

Archivos relacionados:
- backend\src\infrastructure\adapters\externalServices\YgoProDeckCardDetailsAdapter.ts
- backend\src\infrastructure\adapters\externalServices\YgoProDeckCardPreviewAdapter.ts
- frontend\src\layouts\navbar\components\Navbar.tsx
- frontend\src\features\archetypes\components\DeckBuilderCardSearchModal.tsx
- frontend\src\features\archetypes\components\FloatingCardSearchModal.tsx
- frontend\src\features\archetypes\api\cardDetailsApi.ts
- frontend\src\features\archetypes\api\cardDetailsApi.ts
- frontend\src\features\archetypes\api\cardDetailsApi.ts
- frontend\src\features\archetypes\components\CardTooltip.tsx
- frontend\src\features\archetypes -> esta feature contiene cosas generales de nuestro sistema.
- backend\src\routes\archetypes\searchArchetype.ts

Si no me equivoco, esta implementacion no perjudicaría nuestro SEO negativamente, verdad? ya que estamos cambiando solo la forma en la que vienen los datos de la API, y no involucrando contenido de nuestra web y corrienedo riesgo de hacerlo mal o que a google le parezca contenido duplicado/basura, es esto correcto? Me preocupa no arruinar mi SEO porque lo tengo bien cuidado.

Nota importante:
El filtro de busqueda de nombres de arquetipos en la search va a seguir siendo ingles para español, ya que nadie en la comunidad hispana busca nombres de arquetipos en español. Sin embargo, para China y Japon, su forma de buscar nombres de arquetipos es diferente (tienen su propia forma de escribir) y debe ser la que ellos usan.


----------


prompt task screenshot guias:
Perfecto! Ahora, vamos a agregar una nueva funcionalidad para las guias:
- Permitir a los usuarios autenticados generar una captura de pantalla de las guias counter o deck de las cosas que contiene su guia. Debe tener el logo de masterduelcounter en algun lado para identificar la captura con mi web.
Usemos la mejor libreria para esto (como html-to-image, por ejemplo, o alguna que sea mejor si la hay para este caso) y tener en cuenta que las cosas a las que le sacaremos snapshot no van a tener tamaño fijo, ya que cosas como los cardpairs de las guias counter y los combos de las guias deck pueden variar en tamaño dependiendo de la cantidad que haya agregado el creador de la guia. El usuario debe estar autenticado para poder usar el snapshot captura de la guia, de lo contrario, el usuasrio no autenticado al hacer click en la foto va a ver el mensaje de error de "You must be logged in to take a Snapshot". 

Criteria aceptable:
- El boton debe tener el iconito de una camara de foto (si puede usa react lucide, ya que ya tengo esa libreria), y debe estar ubicado en el lugar donde estan ubicados los botones "Edit Archetype" y "Delete Guide" si el usuario esta viendo su propia guia. De no ser su guia, va a ver el boton del Snapshot arriba del boton de Report de la guia
- La imagen sacada debe ser de alta resolucion (buena) ya que esta pensada para usuarios que les gusta compartir imagenes de las cosas importantes de su guia en lugares como Reddit, Twitter, Discord, etc...
- Para las guias tipo Counter, debe tener: Logo de Masterduelcounter, Title del header Handtraps de la guia y sus cardpairs, Title del header BoardBreakers de la guia y sus cardpairs.
- Para las guias tipo Deck, debe tener: Logo de Masterduelcounter, Title Initial Hands de la guia y sus initial hands, title Final Board Preview for
Hand #N y su final board preview, title Combo for Hand #N y su secuencia de comboflow, Recommended Deck (este puede ser mas chico, ya que solo importa ver las imagenes de las cartas en miniatura del deck). Importante: Cada Final Board preview y Combo pertenece a una initial hand distinta, asi que debemos hacer que si se saca un snapshot habiendo elegido la initial hand #1, saque el spanshot con el final bard preview y el comboflow de la initial hand 1, y asi sucesivamente.
- El mensaje de error de "Debes estar logeado para usar el snapshot" debe aparecer en el mismo lugar donde aparecen los mensajes de errores de la validacon de la guia cuando se esta editando.

Piensa en el mejor aproach para agregar esta funcionalidad de forma limpia y mantenible. Es mejor crear una nueva feature o debe ser una funcionalidad hecha en frontend\src\features\guide-editor?

Archivos relacionados:
frontend\src\features\guide-editor\pages\GuideContainerPage.tsx
frontend\src\features\guide-editor\components\GuideContainer.tsx
frontend\src\assets\home-rework\MDC_logo_full.webp (esta es la imagen que usamos para el main logo)

Tambien te he dejado imagenes mostrando de ejemplo como se ve una counterguide completa y una deck guide completa (en caso de que necesites ver como se ven). He sacado varias imagenes para completar toda la vista de una counter guide y deck guide, ya que son muy altas y no entran en una sola imagen. Recuerda instalar la libreria necesaria.