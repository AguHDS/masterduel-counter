import { Router } from "express";
import { Dependencies } from "@/compositionRoot";
import { createGetLatestGuidesController } from "@/http/controllers/guides/getLatestGuidesController";

/** Get the latest created guide instances across all archetypes */
export function createGetLatestGuidesRoute(dependencies: Dependencies) {
  const router = Router();
  const controller = createGetLatestGuidesController(
    dependencies.getInstanceService(),
  );

  router.get("/guides/latest", controller);

  return router;
}
