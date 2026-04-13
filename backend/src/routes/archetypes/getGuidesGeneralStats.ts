import { Router } from "express";
import { createGetGeneralStatsController } from "@/http/controllers/archetypes/getGeneralStatsController.js";
import { getDependencies } from "@/compositionRoot.js";

const router: Router = Router();
const archetypeService = getDependencies().getArchetypeService();
const getGeneralStatsController = createGetGeneralStatsController(archetypeService);

router.get("/archetypes/stats", getGeneralStatsController);

export default router;
