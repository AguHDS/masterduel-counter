# Plan: Fix mensual views (trending) que fugan vistas históricas

## Resumen del problema

La feature **trending mensual** muestra un ranking de guías basado en los stats ganados **solo este mes**.
Las likes y favorites ya se cuentan bien (se toman de las tablas `instance_likes` y `instance_favorites`
filtrando por `created_at` dentro del mes). **El bug está solo en las views.**

Síntoma reportado: una guía publicada hace meses con **110 views totales** aparece en el trending de
septiembre mostrando `views: 110 (110)` — es decir, el sistema cree que las 110 views se ganaron este mes.
Eso es falso: esas views se acumularon desde la creación. Debería mostrar (0) o (1), no (110).

---
1544676350202216458
## Causa raíz

Archivo: `backend/src/infrastructure/repositories/SqliteRankingRepository.ts`

En `getTrendingGuidesForMonth()` (líneas ~339-342) las views mensuales se calculan así:

```ts
const previousViews = previousViewsByGuideId.get(g.id) ?? 0;   // = suma de `views` de TODOS los snapshots previos
const monthlyViews =
  guideCreatedMonth < month && !hasPriorSnapshot
    ? 0
    : Math.max(g.total_views - previousViews, 0);
```

- `previousViews` = suma del campo `views` de **todos** los rows previos de `monthly_guide_rankings`
  para esa guía (líneas ~309-325).
- La idea era: `views del mes = total_actual - suma(views de snapshots previos)`.
- El guard `!hasPriorSnapshot → 0` (agregado en el fix de junio) solo evita la fuga si la guía **no tiene
  ningún snapshot previo**.

**El agujero:** Los snapshots (`monthly_guide_rankings`) solo guardan el **top 15** de cada mes, y el campo
`views` de cada snapshot guarda el **delta mensual**, no el total acumulado. Por lo tanto `suma de deltas`
solo equivale al acumulado si la guía estuvo en el top 15 **todos** los meses de su vida, lo cual casi nunca
pasa. En cuanto la guía aparece en **un solo** snapshot previo (aunque ese snapshot tenga `views = 0`,
porque el mismo guard puso 0 en su primer mes), `hasPriorSnapshot` se vuelve `true`, se desactiva el guard,
y **todas las 110 views históricas se filtran como si fueran de este mes**: `110 - 0 = 110`.

Esto confirma el mecanismo del bug reportado.

### Limitación de datos

No existe un historial fiable de views por mes:
- `archetype_instances.views` es un contador acumulado único (sin timestamps).
- `guide_view_tracking` solo guarda la **última** vista por viewer y se limpia a los 30 días → no sirve.
- Los snapshots solo cubren el top 15 → no dan línea base para todas las guías.

---

## Solución elegida: tabla de línea base (`GuideMonthlyViews`)

Vamos a capturar, cada fin de mes, las **views acumuladas de TODAS las guías** en una tabla nueva.
Así podemos calcular con exactitud las views de un mes como:

```
views_del_mes = views_acumuladas_actuales − views_acumuladas_al_inicio_del_mes
```

Donde `views_acumuladas_al_inicio_del_mes` = el row de `GuideMonthlyViews` del mes **inmediatamente anterior**.

**Ventaja clave:** para el mes actual solo necesitamos la línea base del **mes previo** (que ya incluye
todas las views anteriores, sin importar huecos). A diferencia del enfoque viejo, no hace falta una cadena
contigua de snapshots.

**Comportamiento resultante:**
- Guía creada **este mes** → todas sus views son de este mes → `monthlyViews = total_actual`.
- Guía creada **antes** de este mes con línea base del mes previo → `monthlyViews = total − baseline` (exacto).
- Guía creada **antes** de este mes **sin** línea base del mes previo → `monthlyViews = 0` (no se puede
  separar → se evita la fuga, se muestra 0).

---

## Archivos a modificar

1. `backend/prisma/schema.prisma` — agregar el modelo `GuideMonthlyViews`.
2. `backend/src/infrastructure/repositories/SqliteRankingRepository.ts` — lógica de views.
3. `backend/src/http/controllers/__tests__/ranking.test.ts` — (opcional pero recomendado) tests.

**No se modifica** frontend (`RankingPopup.tsx` / `RankingModal.tsx`): ya muestran `monthlyViews` tal cual.

---

## Paso 1 — Schema (`backend/prisma/schema.prisma`)

Agregar este modelo al final del archivo (junto a los demás modelos de ranking):

```prisma
model GuideMonthlyViews {
  id         Int      @id @default(autoincrement())
  guideId    Int      @map("guide_id")
  month      String   // Formato: YYYY-MM (mes que acaba de terminar cuando se captura la línea base)
  totalViews Int      @map("total_views") // views acumuladas al final de `month`
  createdAt  DateTime @default(now()) @map("created_at")

  @@unique([guideId, month])
  @@index([month])
  @@map("guide_monthly_views")
}
```

> Importante: El usuario maneja `npx prisma db push` y `npx prisma generate` manualmente. **NO ejecutarlos tú.**
> Después de editar el schema, **el usuario** debe ejecutar estos comandos **desde la carpeta `backend`**:
> - `npx prisma generate` (para que el cliente Prisma reconozca `guideMonthlyViews`)
> - `npx prisma db push` (crea la tabla `guide_monthly_views` en la DB de producción)
> - Para tests, **el usuario** debe correr el push contra la DB de tests, también **desde la carpeta `backend`**
>   (NO desde `backend/prisma/src/data/`):
>   ```powershell
>   $env:DATABASE_URL="file:./src/data/test.db"; npx prisma db push
>   ```
>   `file:./src/data/test.db` es relativo a `backend/prisma/`, así que resuelve a
>   `backend/prisma/src/data/test.db` (tu `test.db`). Esto crea `guide_monthly_views` en `test.db`;
>   sin esto los tests nuevos fallan.
>
> No ejecutarlos tú mismo (el usuario lo hace para evitar crasheos).

---

## Paso 2 — `SqliteRankingRepository.ts`

### 2a. Reemplazar el cálculo de views en `getTrendingGuidesForMonth()`

**Eliminar** el bloque actual (líneas ~309-325) que arma `previousViewsByGuideId`:

```ts
const guideIds = filteredGuides.map((g) => g.id);
const previousGuideSnapshots = await this.prisma.monthlyGuideRanking.findMany({ ... });
const previousViewsByGuideId = new Map<number, number>();
for (const snapshotRow of previousGuideSnapshots) { ... }
```

**Reemplazar** por carga de línea base del mes previo:

```ts
const guideIds = filteredGuides.map((g) => g.id);

// Línea base: views acumuladas al INICIO del mes consultado.
// = row de GuideMonthlyViews del mes inmediatamente anterior (capturado por el cron
// al final de ese mes). Con esto calculamos las views del mes como:
//   views_actuales_acumuladas - views_acumuladas_al_inicio_del_mes
const prevMonth = this.getPreviousMonth(month);
const baselines = await this.prisma.guideMonthlyViews.findMany({
  where: {
    month: prevMonth,
    guideId: { in: guideIds },
  },
  select: { guideId: true, totalViews: true },
});
const baselineByGuideId = new Map(baselines.map((b) => [b.guideId, b.totalViews]));
```

**Reemplazar** el cálculo de `monthlyViews` (líneas ~333-342) por:

```ts
const guideCreatedMonth = new Date(g.created_at).toISOString().slice(0, 7);
let monthlyViews: number;
if (guideCreatedMonth >= month) {
  // Guía creada DURANTE el mes consultado -> todas sus views son de este mes.
  monthlyViews = g.total_views;
} else {
  const baseline = baselineByGuideId.get(g.id);
  if (baseline !== undefined) {
    // Hay línea base fiable -> views ganadas durante este mes.
    monthlyViews = Math.max(g.total_views - baseline, 0);
  } else {
    // Guía existía antes de este mes pero NO tenemos línea base del inicio del mes.
    // No se puede separar las views de este mes de las históricas -> 0 para no fugar.
    monthlyViews = 0;
  }
}
```

> Nota: `guideCreatedMonth >= month` compara strings "YYYY-MM" (orden lexicográfico = orden de fechas).
> Como `filteredGuides` ya filtra `created_at <= endTs`, `guideCreatedMonth` nunca es posterior al mes,
> así que `>= month` equivale a "creada este mes".

### 2b. Agregar el helper `getPreviousMonth` como método privado

Agregar junto a los otros helpers privados (por ejemplo después de `guideScore`):

```ts
private getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  const d = new Date(Date.UTC(year, monthNum - 2, 1));
  return d.toISOString().slice(0, 7);
}
```

### 2c. Capturar la línea base en `saveTrendingSnapshot()`

Dentro de `saveTrendingSnapshot(month)` (al final del método, después de guardar los top 15 de guías/usarios,
y fuera del `if (guideSnapshots.length > 0)`), agregar:

```ts
// Capturar línea base de views acumuladas para TODAS las guías de este mes.
// Esto permite calcular las views "de este mes" de forma exacta en meses futuros.
const allGuides = await this.prisma.archetypeInstance.findMany({
  select: { id: true, views: true },
});
await this.prisma.guideMonthlyViews.deleteMany({ where: { month } });
if (allGuides.length > 0) {
  await this.prisma.guideMonthlyViews.createMany({
    data: allGuides.map((g) => ({
      guideId: g.id,
      month,
      totalViews: g.views,
    })),
  });
}
```

> - Esto corre en el cron del día 1, para el **mes anterior** P. Captura las views acumuladas de cada guía
>   al final de P, que es exactamente la línea base necesaria para el mes actual.
> - Se capturan TODAS las `archetype_instances` (igual que el SQL de trending, que no filtra drafts).
> - Se hace `deleteMany({ where: { month } })` antes del `createMany` para que sea idempotente si el cron
>   corre dos veces (mismo patrón que los snapshots top 15).

---

## Paso 3 — Tests (opcional pero recomendado)

Agregar tests en `backend/src/http/controllers/__tests__/ranking.test.ts`, dentro de `describe("Trending Ranking")`,
siguiendo el patrón existente (fixtures en `beforeAll`, cleanup en `beforeEach`, helpers `registerAndLogin` + `createGuide`).

Los tests corren contra `test.db` y deben usar el **mes actual** (el endpoint de trending usa live-calc solo
para el mes actual; los meses pasados usan snapshots). Para simular una guía "vieja", se hace **backdate** de
`createdAt` y se **siembra** la línea base directamente con Prisma.

Helper útil para el mes previo dentro del test:

```ts
function prevMonthString(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.toISOString().slice(0, 7);
}
```

**Test 1 — no fuga sin línea base:**

```ts
it("should not leak historical views for old guides without a baseline", async () => {
  const userA = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
  const userB = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
  const guide = await createGuide(userA, "Old Guide No Baseline");

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  // Backdatear la guía a hace 2 meses y darle 110 views acumuladas
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  await prisma.archetypeInstance.update({
    where: { id: guide.id },
    data: { createdAt: twoMonthsAgo, views: 110 },
  });
  // Un like para que califique al trending
  await likeGuide(userB, guide.id);
  await prisma.$disconnect();

  const res = await request(app).get("/api/ranking/trending/guides");
  const entry = res.body.ranking.find((g: { id: number }) => g.id === guide.id);
  expect(entry).toBeDefined();
  expect(entry.monthlyViews).toBe(0); // sin línea base -> no fuga
});
```

**Test 2 — views mensuales exactas con línea base:**

```ts
it("should compute accurate monthly views using the baseline", async () => {
  const userA = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
  const userB = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
  const guide = await createGuide(userA, "Baseline Guide");

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  await prisma.archetypeInstance.update({
    where: { id: guide.id },
    data: { createdAt: twoMonthsAgo, views: 110 },
  });
  // Línea base del mes previo: la guía tenía 100 views al inicio de este mes
  await prisma.guideMonthlyViews.create({
    data: { guideId: guide.id, month: prevMonthString(), totalViews: 100 },
  });
  await likeGuide(userB, guide.id);
  await prisma.$disconnect();

  const res = await request(app).get("/api/ranking/trending/guides");
  const entry = res.body.ranking.find((g: { id: number }) => g.id === guide.id);
  expect(entry).toBeDefined();
  expect(entry.monthlyViews).toBe(10); // 110 - 100
});
```

**Test 3 — guía creada este mes cuenta todas sus views:**

```ts
it("should count all views for guides created this month", async () => {
  const userA = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
  const userB = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
  const guide = await createGuide(userA, "New Guide This Month");

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.archetypeInstance.update({
    where: { id: guide.id },
    data: { views: 5 },
  });
  await likeGuide(userB, guide.id);
  await prisma.$disconnect();

  const res = await request(app).get("/api/ranking/trending/guides");
  const entry = res.body.ranking.find((g: { id: number }) => g.id === guide.id);
  expect(entry).toBeDefined();
  expect(entry.monthlyViews).toBe(5);
});
```

> Los tests requieren que la tabla `guide_monthly_views` exista en `test.db`. Para eso, **el usuario** debe
> correr, desde la carpeta `backend` (NO desde `backend/prisma/src/data/`):
> ```powershell
> $env:DATABASE_URL="file:./src/data/test.db"; npx prisma db push
> ```
> (ver detalle en el Paso 1). Sin esto, `prisma.guideMonthlyViews` no existe en `test.db` y los tests fallan.

---

## Verificación manual

Los pasos 0 son los que **el usuario** debe correr (NO el agente) al terminar la implementación,
todos desde la carpeta `backend`:

0. **Comandos que debe correr el usuario:**
   - `npx prisma generate`
   - `npx prisma db push`
   - Reiniciar el backend (ej. `pm2 restart`) para que cargue el código y el cron nuevos.
   - **Correr al terminar:** `npm run simulate-snapshot`
     - Llama a `saveTrendingSnapshot(mes_anterior)` y, con el cambio, también guarda la línea base del
       mes anterior → el trending del mes actual queda exacto **de inmediato** (sin esperar al cron del día 1).
     - Si se quiere poblar solo un mes específico: `npm run simulate-snapshot 2026-08` (el mes anterior).

Luego, verificación funcional:

1. Levantar backend y consultar: `GET /api/ranking/trending/guides`
   (sin `?month=` → usa el mes actual).
2. Para una guía vieja con muchas views totales **sin** línea base del mes previo:
   - debe seguir apareciendo si tiene likes/favs este mes,
   - pero `monthlyViews` debe ser **0** (antes era 110).
3. Tras correr `simulate-snapshot` (o el cron del día 1), la línea base queda guardada y las views
   mensuales salen exactas.
4. Para tests, **el usuario** debe correr el push contra `test.db` (ver Paso 1) antes de `npm test`.

---

## Notas y advertencias

- **Datos actuales:** la tabla `GuideMonthlyViews` arranca vacía. Para el mes en curso, las guías viejas sin
  línea base mostrarán `monthlyViews = 0` (no fugan). A partir de que el cron capture el primer mes, las
  cuentas pasan a ser exactas.
- **Likes/favorites** no cambian: siguen saliendo de `instance_likes` / `instance_favorites` por `created_at`.
- **Los usuarios trending** (`getTrendingUsersForMonth`) reutilizan `getTrendingGuidesForMonth` para sus
  views mensuales (línea ~610) → se corrigen solos, no requieren cambios extra.
- **Meses pasados** siguen usando los snapshots top 15 (`month !== currentMonth`) → sin cambios en el
  display histórico.
- No dejar código muerto: eliminar por completo el bloque de `previousGuideSnapshots` / `previousViewsByGuideId`.
- Al terminar, correr `npm run lint` en backend para verificar que no haya errores.
