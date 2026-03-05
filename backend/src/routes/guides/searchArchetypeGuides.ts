import { Router } from "express";
import { Dependencies } from "@/compositionRoot.js";
import { createSearchArchetypeGuidesController } from "@/http/controllers/guides/searchArchetypeGuidesController.js";

/** Search guide instances for an archetype by title */
export function createSearchArchetypeGuidesRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createSearchArchetypeGuidesController(
    dependencies.getInstanceService(),
  );

  router.get("/archetypes/:id/instances/search", controller);

  return router;
}
