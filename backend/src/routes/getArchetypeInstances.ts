import { Router } from "express";
import { Dependencies } from "@/compositionRoot";
import { createGetArchetypeInstancesController } from "@/http/controllers/getArchetypeInstancesController";

export function createGetArchetypeInstancesRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createGetArchetypeInstancesController(
    dependencies.getInstanceService(),
  );

  router.get("/archetypes/:id/instances", controller);

  return router;
}
