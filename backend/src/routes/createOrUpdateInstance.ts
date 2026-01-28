import { Router } from "express";
import { Dependencies } from "@/compositionRoot";
import { createCreateOrUpdateInstanceController } from "@/http/controllers/createOrUpdateInstanceController";
import { requireAuth } from "@/http/middlewares/authMiddleware";

export function createCreateOrUpdateInstanceRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createCreateOrUpdateInstanceController(
    dependencies.getInstanceService(),
  );

  router.post("/archetypes/:id/instances", requireAuth, controller);

  return router;
}
