import { Router } from "express";
import { getStatusController } from "@/http/controllers/status/getStatusController.js";

const router = Router();

// Public: site status (server maintenance flag) for the frontend gate
router.get("/", getStatusController);

export default router;