import { Router } from "express";
import { registerGuideViewController } from "@/http/controllers/guides/registerGuideViewController.js";

const router = Router();

// Register a view for an instance (no auth required)
router.post(
  "/instances/:instanceId/view",
  registerGuideViewController
);

export default router;
