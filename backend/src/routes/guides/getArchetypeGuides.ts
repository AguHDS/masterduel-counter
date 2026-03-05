import { Router } from "express";
import { Dependencies } from "@/compositionRoot.js";
import { createGetArchetypeGuidesController } from "@/http/controllers/guides/getArchetypeGuidesController.js";

/** Get all guide instances for an archetype created by all users */
export function createGetArchetypeGuidesRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createGetArchetypeGuidesController(
    dependencies.getInstanceService(),
  );

  router.get("/archetypes/:id/instances", controller);

  return router;
}
