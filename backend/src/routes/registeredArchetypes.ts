import { Router } from "express";
import { getRegisteredArchetypesController } from "@/http/controllers/getRegisteredArchetypesController";

const router = Router();

router.get("/registered", getRegisteredArchetypesController);

export default router;
