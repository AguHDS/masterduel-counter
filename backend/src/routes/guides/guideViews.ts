import { Router } from "express";
import { registerInstanceViewController } from "@/http/controllers/guides/registerInstanceViewController.js";

const router = Router();

// Register a view for an instance (no auth required)
router.post(
  "/instances/:instanceId/view",
  registerInstanceViewController
);

export default router;
