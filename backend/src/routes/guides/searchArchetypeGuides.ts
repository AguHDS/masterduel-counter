import { Router } from "express";
import { Dependencies } from "@/compositionRoot";
import { createSearchArchetypeGuidesController } from "@/http/controllers/guides/searchArchetypeGuidesController";

/** Search guide instances for an archetype by title */
export function createSearchArchetypeGuidesRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createSearchArchetypeGuidesController(
    dependencies.getInstanceService(),
  );

  router.get("/archetypes/:id/instances/search", controller);

  return router;
}
