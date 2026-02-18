import { Router } from "express";
import { Dependencies } from "@/compositionRoot";
import { createGetUserGuidesController } from "@/http/controllers/profile/getUserGuidesController";

/** Get user guides (for user profile) */
export function createGetUserGuidesRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createGetUserGuidesController(
    dependencies.getInstanceService(),
  );

  router.get("/users/:userId/instances", controller);

  return router;
}
