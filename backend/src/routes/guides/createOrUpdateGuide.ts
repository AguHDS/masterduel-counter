import { Router } from "express";
import { Dependencies } from "@/compositionRoot.js";
import { createCreateOrUpdateInstanceController } from "@/http/controllers/guides/createOrUpdateInstanceController.js";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";

/** Create or update a guide for the authenticated user */
export function createOrUpdateGuideRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createCreateOrUpdateInstanceController(
    dependencies.getInstanceService(),
  );

  router.post("/archetypes/:id/instances", requireAuth, controller);

  return router;
}
