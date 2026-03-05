import { Router } from "express";
import { Dependencies } from "@/compositionRoot.js";
import { createGetLatestGuidesController } from "@/http/controllers/guides/getLatestGuidesController.js";

/** Get the latest created guide instances across all archetypes */
export function createGetLatestGuidesRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createGetLatestGuidesController(
    dependencies.getInstanceService(),
  );

  router.get("/guides/latest", controller);

  return router;
}
