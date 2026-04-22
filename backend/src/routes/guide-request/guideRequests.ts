import { Router } from "express";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import { optionalAuthMiddleware } from "@/http/middlewares/auth/optionalAuthMiddleware.js";
import { validateCreateGuideRequest } from "@/http/middlewares/guide-request/validateGuideRequestMiddleware.js";
import { createGuideRequestController } from "@/http/controllers/guide-request/createGuideRequestController.js";
import { getGuideRequestsController } from "@/http/controllers/guide-request/getGuideRequestsController.js";
import { getRecentGuideRequestsController } from "@/http/controllers/guide-request/getRecentGuideRequestsController.js";
import { getGuideRequestByIdController } from "@/http/controllers/guide-request/getGuideRequestByIdController.js";
import { takeGuideRequestController } from "@/http/controllers/guide-request/takeGuideRequestController.js";
import { cancelTakeGuideRequestController } from "@/http/controllers/guide-request/cancelTakeGuideRequestController.js";
import { fulfillGuideRequestController } from "@/http/controllers/guide-request/fulfillGuideRequestController.js";
import { getGuideRequestCountsController } from "@/http/controllers/guide-request/getGuideRequestCountsController.js";

const router = Router();

/** Get all guide requests (paginated, optional status filter) */
router.get("/", getGuideRequestsController);

/** Get counts per status (for tab badges) */
router.get("/counts", getGuideRequestCountsController);

/** Get recent OPEN guide requests (for home page / navbar) */
router.get("/recent", getRecentGuideRequestsController);

/** Get a single guide request by ID */
router.get("/:id", getGuideRequestByIdController);

/** Create a new guide request (auth optional, anonymous allowed) */
router.post("/", optionalAuthMiddleware, validateCreateGuideRequest, createGuideRequestController);

/** Take a guide request */
router.post("/:id/take", requireAuth, takeGuideRequestController);

/** Cancel a taken request */
router.post("/:id/cancel-take", requireAuth, cancelTakeGuideRequestController);

/** Fulfill a guide request by linking it to a saved guide instance */
router.post("/:id/fulfill", requireAuth, fulfillGuideRequestController);

export default router;
