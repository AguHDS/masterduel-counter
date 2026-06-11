import { Router } from "express";
import { verifyAdminMiddleware } from "@/http/middlewares/admin/verifyAdminMiddleware.js";
import {
  createLatestUpdateController,
  getAllLatestUpdatesController,
  getLatestUpdateByIdController,
  getAllPaginatedLastestUpdatesController,
  updateLatestUpdateController,
  deleteLatestUpdateController,
} from "@/http/controllers/latest-updates/index.js";

const router = Router();

// Public routes
router.get("/", getAllLatestUpdatesController);
router.get("/all", getAllPaginatedLastestUpdatesController);
router.get("/:id", getLatestUpdateByIdController);

// Admin only routes
router.post("/", verifyAdminMiddleware, createLatestUpdateController);
router.put("/:id", verifyAdminMiddleware, updateLatestUpdateController);
router.delete("/:id", verifyAdminMiddleware, deleteLatestUpdateController);

export default router;
