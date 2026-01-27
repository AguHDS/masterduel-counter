import { Router } from "express";
import { registerArchetypeController } from "../http/controllers/registerArchetypeController";
import { registerArchetypeMiddleware } from "../http/middlewares/registerArchetypeMiddleware";
import { verifyAdminAuthMiddleware } from "../http/middlewares/verifyAdminAuthMiddleware";
import { getArchetypeCardPairsController } from "../http/controllers/getArchetypeCardPairsController";
import { getArchetypeWithHeaderController } from "../http/controllers/getArchetypeWithHeaderController";

const router = Router();

router.post(
  "/:id/register",
  verifyAdminAuthMiddleware,
  registerArchetypeMiddleware,
  registerArchetypeController,
);

router.get(
  "/:id/card-pairs",
  getArchetypeCardPairsController,
);

router.get(
  "/:id/with-header",
  getArchetypeWithHeaderController,
);

export default router;
