import { Router } from "express";
import { Dependencies } from "@/compositionRoot.js";
import { createSearchUserGuidesController } from "@/http/controllers/guides/searchUserGuidesController.js";

/** Search guide instances for a user by title */
export function createSearchUserGuidesRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createSearchUserGuidesController(
    dependencies.getInstanceService(),
  );

  router.get("/users/:userId/instances/search", controller);

  return router;
}
