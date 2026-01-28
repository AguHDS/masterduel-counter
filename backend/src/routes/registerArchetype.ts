import { Router } from "express";
import { registerArchetypeController } from "../http/controllers/registerArchetypeController";
import { registerArchetypeMiddleware } from "../http/middlewares/registerArchetypeMiddleware";
import { requireAuth } from "../http/middlewares/authMiddleware";
import { getArchetypeWithHeaderController } from "../http/controllers/getArchetypeWithHeaderController";

const router = Router();

router.post(
  "/:id/register",
  requireAuth,
  registerArchetypeMiddleware,
  registerArchetypeController,
);

router.get(
  "/:id/with-header",
  getArchetypeWithHeaderController,
);

export default router;
