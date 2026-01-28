import { Router } from "express";
import { deleteUserInstanceController } from "@/http/controllers/deleteUserInstanceController";
import { requireAuth } from "@/http/middlewares/authMiddleware";

const router = Router();

router.delete(
  "/archetypes/:archetypeId/users/:userId/instance",
  requireAuth,
  deleteUserInstanceController
);

export default router;
