import { Router } from "express";
import { ArchetypeServicePort } from "@/application/ports/ArchetypeService";
import { createGetGeneralStatsController } from "@/http/controllers/archetypes/getGeneralStatsController";
import { getDependencies } from "@/compositionRoot";

export const createGetGeneralStatsRoute = (): Router => {
  const router = Router();
  const archetypeService = getDependencies().getArchetypeService();
  const controller = createGetGeneralStatsController(archetypeService);

  router.get("/archetypes/stats", controller);

  return router;
};
