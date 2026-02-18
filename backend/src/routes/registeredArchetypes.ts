import { Router } from "express";
import { getRegisteredArchetypesController } from "@/http/controllers/getRegisteredArchetypesController";

const router = Router();

/** Get registered archetypes to display in the homepage */
router.get("/registered", getRegisteredArchetypesController);

export default router;
