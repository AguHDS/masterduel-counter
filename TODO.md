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
- Mejorar MUCHO el responsive de las guias y la home, ya que gente viene de twitter.
Cuando la vista sea para mobile (iPhone SE por ejemplo el mas importante), debemos hacer que la guia ya no use el contianer principal y ocupe toda la pantalla, para poder tener mas espacio para acomodar los combos y cosas.
Una vez hecho eso, pensar como podemos darle veracidad en twitter, porque vi que las visitas masivas vinieron de ahi por mobile
Podriamos usar mi cuenta vieja de twitter con muchos seguidores, o crear una de masterduelcounter, no se. La idea es hacer esto cuando
el responsive para los de twitter ya funcione.
- En los decks, ordenar las cartas por tipo, ahora se desordenan
- Mostrar nivel de carta en numero en tooltip
- Mejorar thumbnail para cuando comparten el logo de la web en twitter, ahora se ve incompleto y desproporcionado. Quiza deberiamos crear un thumbail para twitter?s
- agregar title al perfil, ahora dice la url en la pestaña de navegador
- Agregar pequeña feature que deje poner Last Updates, en el panel de admin puedo poner nuevas updates que se muestran en la home, para que los usuarios sepan cuando hay cambios importantes, mantenimiento, etc.
- En reddit un usuario me dijo que el comboflow tiene espacio muerto, ver como arreglar esto, fijarse el chat.
- sistema de draft para guias guardadas. Cambiar el boton save changes a publish, pensar en que hacer con las guias que son creadas a partir de una request, que pasa si se guarda como draft una de estas, ya que las guias tomadas de una request tienen 24hs para completarse
- en Generalstats, mejorarlo con lazy loading (scroll infinito optimizado, no solo 15 items) y un search compartido. Ademas mejorar el diseño ya que tambien tenemos que agregar "total guides". Pensar en un diseño apropiado para un container como este que muestra la cantidad de guias counter/deck y metadata.
- Hacer que al tomar una request, en lugar de llevarte directo a la creacion de la misma, se ponga como "Pending". El usuario que la tomo tiene 24hs para cumplir esta request. Si no le cumple, vuelve a estar OPEN.
El usuario que la tomo puede ir a la creacion de guia de esa request en el modal donde muestra la informacion de esta que esta in progress.
- en la lista de Guias y Favorites del perfil, tambien ordenar por views,likes. Updated (mas reciente, primero) debe ser default y creo que ya lo tiene puesto asi.

bugs:
- El ranking trending del mes actual no esta funcionando bien. Ahora estamos a 4 de junio, y en el trending del mes muestra en el top 15 guias que fueron publicadas en mayo y no deberian aparecer ahora en el trending del top de junio, porque para entrar al trending del mes actual se debe cumplir un requisito minimo de stats actuales (views, likes, etc) en cada nuevo especifico mes.
Por ejemplo, hay una guia que se publico el 4 de mayo, tiene 62 vistias, y ahora en trending top 15 de junio esta como lugar #14 con estos datos: 62 views (+62) - 0 likes (+0) - 0 favorites (+0). Si te fijas esta tomando el total de visitas que tuvo desde que se publico y lo esta poniendo como si hubiera ganado de golpe esas 62 visitas en este mes, y no deberia ser asi. Deberia empezar a contar el requerimiento para entrar al trending a partir de este mes actual. Esto pasa con algunas guias, no todas.
Luego, la que esta en puesto #1 tambien tiene el mismo problema, dice que tiene como stats 155 views (+155), y recien estamos a 4 de este mes y esas son las visitas que tuvo siempre. Por que pasa esto? investigar y arreglar.

Nota: Si una guia no cumple con el requisito minimo de stats mensual, NO puede entrar al top 15 trending de este mes. Si se da el caso que no hay 15 guias totales, solo poner las que cumplen el requisito minimo, y no completar el top 15 con guias que no cumplen el requisito.

- si modifico la carta favorita, se guarda incluso si cancelo, limpiar bien los estados de edicion
- Si busco arquetipos y los selecciono en la search principal, a veces no muestra el resultado del ultimo buscado
- Si clickeo el boton De Support Us se re-renderea 2 veces y me scrollea arriba de todo de la homepage.
- si edito la endboard de una initial hand que fue copiada, se edita la original.
- Bug responsive en la maincard de los steps de las guias tipo deck:
EN EDIT MODE: cada vez que se va achicando la main card, se le va comiendo los bordes derecho y izquierdo hasta que desaparece. Hay que acomodar el estilo de la maincard para que se achique sin desaparecer.
Esto SOLO pasa en modo edicion.Quiza hacer que el step se vaya achicando gradualmente y la maincard no se achique en cuanto a width? esto capaz va a requerir ir haciendo que entren los steps en cada vista gradual responsive para que no colisionen.


resolviendo:
Implemente una nueva caracteristica en mi app y el agente al terminar el trabajo me dijo que pruebe los cambios asi que lo hice. No esta funcionando como deberia. Este es el prompt que le di (para que entiendas de que se trata la task):

Tengo una web sobre yugioh donde usuarios pueden crear sus guias (de tipo counter guide o deck guide)
Lee el archivo .docs\memory.md (en la raiz del proyecto) para tener un buen contexto del proyecto

Que vamos a hacer? vamos a implementar una nueva caracteristica en la creacion de una guia.

Task: Sistema de draft para cuando se esta creando una guia por primera vez.
- Cuando se esta creando una guia POR PRIMERA VEZ (counter guide o deck guide), agregarun boton "Draft" a la izquierda del boton de Save Changes.
Este boton Draft va a guardar esa guia en modo privado para el propietario (solo la puede ver el) con los cambios que hizo, para que pueda seguirla editando cuando el quiera en el futuro. Al clickearlo, mostrar un cartel que diga "Guide saved as draft, you can find it in your profile in the Guides tab".
- Solo se puede tener 3 guias diferentes tipo draft guardadas como maximo. Si se intenta guardar un nuevo draft en la creacion de una guia, y ya hay 3 drafts guardados, mostrar un mensaje de error que diga "You can't have more than three draft at a time".
- Boton "Delete Draft" que aparece solo si hay una guia guardada como draft, y que al hacer click borra esa guia draft guardada.
- En el perfil, las guias draft se guardan en la tab Guides. Aparecen con un color gris y con un badge "Draft".
- Si se vuelve a editar la guia de draft, se hace cambios y se vuelve a guardar como draft con el boton "Save Draft", se actualiza el mismo draft guardado, no se crea uno nuevo ni se publica. La guia solo se publica si se clickea el boton de Save Changes, y el draft es eliminado.
- El draft solo se puede hacer y su boton solo existe cuando una guia se esta creando por primera vez, no cuando se esta editando una ya publicada.
- Tener en cuenta que tambien tenemos una feature guide-requests. Es una feature que permite a usuarios crear requests de creacion de guias que los usuarios autenticados pueden tomar para crear una guia a partir de esa request. Si no mal recuerdo, una request tomada que no se completó en las 24hs, vuelve a estar en estado Open. Hay que tener en cuenta esto para no tener problemas cuando estamos identificando una guia normal que se puede guardar como draft indefinidamente, y una guia que se esta creando a partir de una request, que si se guarda como draft, no puede queda guardada indefinidamente, porque la request tiene un tiempo limite de 24hs para ser completada. Entonces, si pasan 24hs y la draft guardada es de una guia que se esta creando a partir de una request, esa guia draft guardada tiene que ser eliminada automaticamente pasadas las 24hs.

Esa es la task, los problemas son:
- Al guardar una guia por primera vez, dice que se guardo y que puedo encontrar la guia en la tab de guias del perfil, pero no apararece. En la db si existe la draft.
- Ademas, a veces intento guardar una draft y en el render aparecio un error de "Error saving draft" o algo asi, pero igual la guia se habia guardado. Chequear estas cosas.
- Los mensajes de error en el render como "no puedes tener mas de 3 draft" no se estan reflejando en el render correctamente.
- Ademas debemos hacer que cuando una guia ya esta guardada como Draft, el boton "Draft" debe cambiar a "Update Draft".
- Asegurarse de que si se guarda mas de una vez el mismo Draft, se actualice el mismo draft guardado y no se creen multiples drafts.

Estos son los archivos modificados con los cambios que hice hata ahora (te paso las trozos que agreuge):
backend/prisma/schema.prisma
isDraft          Boolean   @default(false) @map("is_draft")
draftExpiresAt   DateTime? @map("draft_expires_at")
backend/src/application/ports/GuideApplicationPort.ts
SaveDraftDTO,
  /** Saves or updates a draft guide (max 3 drafts per user) */
  saveDraft(data: SaveDraftDTO): Promise<Guide>;

  /** Deletes a draft guide (only the owner can delete their own drafts) */
  deleteDraft(instanceId: number, userId: string): Promise<void>;

  /** Gets the number of draft guides a user currently has */
  getUserDraftCount(userId: string): Promise<number>;
backend/src/application/ports/ProfileApplicationPort.ts
/** Get all guides (including drafts) created by a specific user — only for the owner */
getGuideListByUserIdWithDrafts(userId: string, sortBy?: 'likes' | 'updated', guideType?: GuideType): Promise<GuideListItem[]>;
backend/src/application/services/GuideApplicationService.ts
  SaveDraftDTO,
  /** Saves or updates a draft guide (max 3 drafts per user) */
  async saveDraft(data: SaveDraftDTO): Promise<Guide> {
    const MAX_DRAFTS = 3;
    const {
      archetypeId,
      userId,
      guideType,
      title,
      headerCardId,
      generalTip,
      cardPairs,
      initialHands,
      comboSteps,
      draftInstanceId,
      draftExpiresAt,
    } = data;

    if (draftInstanceId) {
      // Update existing draft — verify ownership and that it is actually a draft
      const existing = await this.instanceRepository.findArchetypeInstanceById(draftInstanceId);
      if (!existing) throw new Error("Draft not found");
      if (existing.userId !== userId) throw new Error("Unauthorized: You can only edit your own drafts");
      if (!existing.isDraft) throw new Error("This guide is not a draft");
    } else {
      // Creating a new draft — enforce the 3-draft limit
      const draftCount = await this.instanceRepository.getUserDraftCount(userId);
      if (draftCount >= MAX_DRAFTS) {
        throw new Error("You can't have more than three draft at a time");
      }
    }

    const draft = await this.instanceRepository.saveDraft({
      archetypeId,
      userId,
      guideType,
      title,
      headerCardId,
      generalTip,
      cardPairs,
      initialHands,
      comboSteps,
      draftInstanceId,
      draftExpiresAt,
    });

    return draft;
  }

  /** Deletes a draft guide (only the owner can delete their own drafts) */
  async deleteDraft(instanceId: number, userId: string): Promise<void> {
    const instance = await this.instanceRepository.findArchetypeInstanceById(instanceId);
    if (!instance) throw new Error("Draft not found");
    if (instance.userId !== userId) throw new Error("Unauthorized: You can only delete your own drafts");
    if (!instance.isDraft) throw new Error("This guide is not a draft");
    await this.instanceRepository.deleteArchetypeInstanceById(instanceId);
  }

  /** Gets the number of draft guides a user currently has */
  async getUserDraftCount(userId: string): Promise<number> {
    return this.instanceRepository.getUserDraftCount(userId);
  }

draftInstanceId,

// If publishing from a draft, delete the draft
if (draftInstanceId) {
    const draft = await this.instanceRepository.findArchetypeInstanceById(draftInstanceId);
    if (draft && draft.userId === userId && draft.isDraft) {
    await this.instanceRepository.deleteArchetypeInstanceById(draftInstanceId);
    }
}

backend/src/application/services/ProfileApplicationService.ts
  /** Get all guides (including drafts) created by a specific user — only for the owner */
  async getGuideListByUserIdWithDrafts(
    userId: string,
    sortBy: "likes" | "updated" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    return this.guideRepository.findArchetypeGuidesByUserIdWithDrafts(userId, sortBy, guideType);
  }
backend/src/domain/Guide.ts
isDraft: boolean;
draftExpiresAt?: Date | null;

isDraft?: boolean;
draftExpiresAt?: Date | null;

  /** If provided, the draft with this ID will be deleted after successful publish */
  draftInstanceId?: number;
}

export interface SaveDraftDTO {
  archetypeId: number;
  userId: string;
  guideType: GuideType;
  title?: string;
  headerCardId?: number | null;
  generalTip?: string | null;
  cardPairs?: Array<{
    topCardIds: number[];
    bottomCardIds: Array<{ cardId: number; effectiveness?: string | null }>;
    pairSection?: "HANDTRAP" | "BOARD_BREAKER" | null;
    comment?: string;
  }>;
  initialHands?: Array<{
    cardIds: number[];
    description?: string;
    finalBoard?: FinalBoardPreview;
  }>;
  comboSteps?: Array<{
    initialHandId: number;
    steps: Array<{
      mainCardIds: number[];
      mainCardChains?: (number | null)[];
      subCardIds: number[];
      subCardChains?: (number | null)[];
      leftSubCardIds: number[];
      leftSubCardChains?: (number | null)[];
      description?: string;
      parentCanceledStepIndex?: number;
      stepOrder: number;
    }>;
  }>;
  /** If provided, update this existing draft instead of creating a new one */
  draftInstanceId?: number;
  /** If set, the draft will auto-expire at this date (used for guide-request drafts) */
  draftExpiresAt?: Date | null;

backend/src/domain/ports/GuideRepository.ts
  SaveDraftDTO,
    /** Find guides by user ID, optionally including drafts (only for the owner) */
  findArchetypeGuidesByUserIdWithDrafts(userId: string, sortBy?: SortOrder, guideType?: GuideType): Promise<GuideListItem[]>;
  /** Count how many draft guides a user currently has */
  getUserDraftCount(userId: string): Promise<number>;
  /** Save or update a draft guide */
  saveDraft(data: SaveDraftDTO): Promise<Guide>;
  /** Delete expired draft guides (where draftExpiresAt < now) */
  deleteExpiredDrafts(): Promise<number>;

backend/src/http/controllers/archetypes/deleteDraftController.ts (todo)

backend/src/http/controllers/archetypes/registerGuideController.ts
, draftInstanceId
 draftInstanceId: draftInstanceId ? parseInt(String(draftInstanceId), 10) : undefined,
backend/src/http/controllers/archetypes/saveDraftController.ts (todo)

backend/src/http/controllers/profile/getUserGuidesController.ts
import { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";
      // Check if the requesting user is the owner of the profile
      const requestingUserId = (req as AuthenticatedRequest).user?.id;
      const isOwner = requestingUserId === userId;

      let instances;
      if (isOwner) {
        // Owner sees their own guides including drafts
        instances = await profileService.getGuideListByUserIdWithDrafts(
          userId,
          sortBy || 'updated'
        );
      } else {
        // Other users only see published guides
        instances = await profileService.getGuideListByUserId(
          userId,
          sortBy || 'updated'
        );
      }

backend/src/infrastructure/repositories/SqliteArchetypeGuideRepository.ts (Muchos cambios y borrado de cosas, no puedo ponerlo todo, por favor usa tu intuicion para ver el estado del archivo y lo que tiene que ver con el tema asi sabes que cosas revisar especificamente)
backend/src/routes/archetypes/archetypeGuide.ts
import { saveDraftController } from "@/http/controllers/archetypes/saveDraftController.js";
import { deleteDraftController } from "@/http/controllers/archetypes/deleteDraftController.js";

/** Save or update a draft guide (max 3 per user) */
router.post(
  "/:id/draft",
  requireAuth,
  saveDraftController,
);

/** Delete a draft guide */
router.delete(
  "/draft/:draftId",
  requireAuth,
  deleteDraftController,
);
backend/src/services/cleanupService.ts
/**
 * Deletes draft guides whose draftExpiresAt has passed (used for guide-request drafts).
 * @returns Number of deleted drafts
 */
export async function cleanupExpiredDrafts(): Promise<number> {
  try {
    const deletedCount = await getDependencies()
      .getInstanceRepository()
      .deleteExpiredDrafts();

    if (deletedCount > 0) {
      console.log(
        `[Cleanup Service] Deleted ${deletedCount} expired draft guide(s).`,
      );
    }

    return deletedCount;
  } catch (error) {
    console.error(`[Cleanup Service] Error during expired draft cleanup:`, error);
    return 0;
  }
}
frontend/src/features/guide-editor/api/guideEditorApi.ts
export interface SaveDraftResponse {
  success: boolean;
  draft: {
    id: number;
    archetypeId: number;
    userId: string;
    title: string;
    headerCardId: number | null;
    generalTip: string | null;
    guideType: string;
    isDraft: boolean;
    draftExpiresAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

  draftInstanceId?: number,
  , draftInstanceId

  /**
 * Save or update a draft guide
 */
export const saveDraftGuide = async (
  archetypeId: number,
  guideType: GuideType,
  cardPairs?: CardPairDTO[],
  initialHands?: Array<{
    cardIds: number[];
    description?: string;
    finalBoard?: FinalBoardDTO;
  }>,
  title?: string,
  headerCardId?: number | null,
  generalTip?: string | null,
  comboSteps?: ComboStepsDTO[],
  draftInstanceId?: number,
  isGuideRequest?: boolean,
): Promise<SaveDraftResponse> => {
  const response = await axiosClient.post<SaveDraftResponse>(
    `/api/archetypes/${archetypeId}/draft`,
    {
      guideType,
      cardPairs,
      initialHands,
      title,
      headerCardId,
      generalTip,
      comboSteps,
      draftInstanceId,
      isGuideRequest,
    },
  );
  return response.data;
};

/**
 * Delete a draft guide
 */
export const deleteDraftGuide = async (
  draftId: number,
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosClient.delete<{ success: boolean; message: string }>(
    `/api/archetypes/draft/${draftId}`,
  );
  return response.data;
};
frontend/src/features/guide-editor/components/GuideContainer.tsx
  FileText,
  import { useSaveDraft, useDeleteDraft } from "../hooks/useArchetypeQueries";

  // Draft state — only relevant when creating a new guide (isCreatingNew)
  const [draftInstanceId, setDraftInstanceId] = useState<number | undefined>(undefined);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const saveDraftMutation = useSaveDraft();
  const deleteDraftMutation = useDeleteDraft();

  /**
   * Saves the current guide state as a draft (only when creating a new guide)
   */
  const handleSaveDraft = async () => {
    if (!archetypeIdNum) return;
    setSavingDraft(true);
    setDraftMessage(null);
    setDraftError(null);
    try {
      const cardPairsForDraft = guideType === "COUNTER"
        ? pairs
            .filter((p) => p.topCards.length > 0 || p.bottomCards.length > 0)
            .map((pair) => ({
              topCardIds: pair.topCards.map((c) => c.id),
              bottomCardIds: pair.bottomCards.map((c) => ({
                cardId: c.id,
                effectiveness: c.effectiveness ?? undefined,
              })),
              pairSection: pair.section ?? null,
              comment: pair.comment ?? undefined,
            }))
        : undefined;

      const initialHandsForDraft = guideType === "DECK"
        ? initialHands
            .filter((h) => h.cards.length > 0)
            .map((h) => ({
              cardIds: h.cards.map((c) => c.id),
              description: h.description || undefined,
            }))
        : undefined;

      const result = await saveDraftMutation.mutateAsync({
        archetypeId: archetypeIdNum,
        guideType,
        cardPairs: cardPairsForDraft,
        initialHands: initialHandsForDraft,
        title: editor.title || undefined,
        headerCardId: editor.headerCard?.id ?? null,
        generalTip: editor.generalTip || null,
        draftInstanceId,
        isGuideRequest: !!guideRequestId,
      });

      setDraftInstanceId(result.draft.id);
      setDraftMessage(result.message);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to save draft.";
      setDraftError(msg);
    } finally {
      setSavingDraft(false);
    }
  };

  /**
   * Deletes the current draft guide
   */
  const handleDeleteDraft = async () => {
    if (!draftInstanceId) return;
    const confirmed = confirm("Are you sure you want to delete this draft?");
    if (!confirmed) return;
    try {
      await deleteDraftMutation.mutateAsync({ draftId: draftInstanceId });
      setDraftInstanceId(undefined);
      setDraftMessage(null);
      setDraftError(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete draft.";
      setDraftError(msg);
    }
  };


{/* Draft button — only when creating a new guide */}
{isCreatingNew && (
    <button
    onClick={handleSaveDraft}
    disabled={savingDraft || saving}
    className="flex items-center space-x-2 px-4 py-2 bg-slate-700/60 backdrop-blur-sm hover:bg-slate-700/90 active:bg-slate-700/30 text-slate-200 rounded-lg transition-colors shadow-md text-sm"
    >
    <FileText className="w-4 h-4" />
    <span>{savingDraft ? "Saving draft..." : draftInstanceId ? "Save Draft" : "Draft"}</span>
    </button>
)}
{/* Delete Draft button — only when a draft exists */}
{isCreatingNew && draftInstanceId && (
    <button
    onClick={handleDeleteDraft}
    disabled={savingDraft || saving}
    className="flex items-center space-x-2 px-4 py-2 bg-red-900/40 backdrop-blur-sm hover:bg-red-900/70 active:bg-red-900/20 text-red-300 rounded-lg transition-colors shadow-md text-sm"
    >
    <Trash2 className="w-4 h-4" />
    <span>Delete Draft</span>
    </button>
)}

{/* Draft feedback messages */}
{draftMessage && (
<p className="text-slate-300 text-sm text-center max-w-md bg-slate-800/60 px-4 py-2 rounded-lg">
    {draftMessage}
</p>
)}
{draftError && (
<p className="text-red-400 text-sm text-center max-w-md">
    {draftError}
</p>
)}
        
frontend/src/features/guide-editor/hooks/useArchetypeQueries.ts
saveDraftGuide,
deleteDraftGuide,
type SaveDraftResponse,
type ComboStepsDTO,

draftInstanceId?: number;

draftInstanceId,

draftInstanceId,


/**
 * Mutation hook for saving a draft guide
 */
export const useSaveDraft = () => {
  return useMutation<
    SaveDraftResponse,
    Error,
    {
      archetypeId: number;
      guideType: GuideType;
      cardPairs?: CardPairDTO[];
      initialHands?: Array<{
        cardIds: number[];
        description?: string;
        finalBoard?: FinalBoardDTO;
      }>;
      title?: string;
      headerCardId?: number | null;
      generalTip?: string | null;
      comboSteps?: ComboStepsDTO[];
      draftInstanceId?: number;
      isGuideRequest?: boolean;
    }
  >({
    mutationFn: ({
      archetypeId,
      guideType,
      cardPairs,
      initialHands,
      title,
      headerCardId,
      generalTip,
      comboSteps,
      draftInstanceId,
      isGuideRequest,
    }) =>
      saveDraftGuide(
        archetypeId,
        guideType,
        cardPairs,
        initialHands,
        title,
        headerCardId,
        generalTip,
        comboSteps,
        draftInstanceId,
        isGuideRequest,
      ),
  });
};

/**
 * Mutation hook for deleting a draft guide
 */
export const useDeleteDraft = () => {
  return useMutation<
    { success: boolean; message: string },
    Error,
    { draftId: number }
  >({
    mutationFn: ({ draftId }) => deleteDraftGuide(draftId),
  });
};
frontend/src/features/guide-editor/hooks/useSaveInstanceGuide.ts
  /** If publishing from a draft, pass the draft ID so it gets deleted after publish */
  draftInstanceId?: number;
frontend/src/features/profile/components/ProfileGuideList.tsx
, FileText

if (guide.isDraft) {
    // Draft guides navigate to the creation page for that archetype
    navigate(`/archetypes/${guide.archetypeId}/instances/new?type=${guide.guideType === "COUNTER" ? "counter" : "deck"}`);
    return;
}
... y luego el jsx

frontend/src/lib/http/guideInstancesApi.ts
/** True when this guide is saved as a draft (only visible to the owner) */
isDraft?: boolean;

Puse algunos console.logs antes para debugear, no creo que ayude mucho, pero estos son los logs de la terminal del backend al momento de guardar el draft y al entrar al perfil del usuario:
Primer intento (se guardo el draft con exito):
console.logs:
handleSaveDraftRequest: {
    "archetypeId": 8,
    "guideType": "COUNTER",
    "title": "TestDraaft ABC Agustin"
}
handleSaveDraftSuccess:
{
    "success": true,
    "draft": {
        "id": 114,
        "archetypeId": 8,
        "userId": "nAFbRlpaYlcOwzNj8lLVWGZhipF7rtdX",
        "title": "TestDraaft ABC Agustin",
        "headerCardId": 14261867,
        "generalTip": null,
        "guideType": "COUNTER",
        "isDraft": true,
        "draftExpiresAt": null,
        "likes": 0,
        "favorites": 0,
        "views": 0,
        "createdAt": "2026-05-16T19:06:45.000Z",
        "updatedAt": "2026-05-16T19:06:45.000Z"
    },
    "message": "Guide saved as draft, you can find it in your profile in the Guides tab"
}

Entro al perfil del usuario:
getUserGuidesController {
  userId: 'nAFbRlpaYlcOwzNj8lLVWGZhipF7rtdX',
  requestingUserId: undefined,
  isOwner: false,
  sortBy: 'likes'
}

Puedes identificar la posible causa del error?

- Recordatorio: En junio, tiene que resetearse el ranking popup a junio y en el perfil poner entradas de May.