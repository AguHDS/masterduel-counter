import { Router } from "express";
import { Dependencies } from "@/compositionRoot";
import { createGetUserInstancesController } from "@/http/controllers/getUserInstancesController";

/** Get user instances (for user profile) */
export function createGetUserInstancesRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createGetUserInstancesController(
    dependencies.getInstanceService(),
  );

  router.get("/users/:userId/instances", controller);

  return router;
}
