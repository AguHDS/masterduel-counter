import { Router } from "express";
import { deleteUserInstanceController } from "@/http/controllers/deleteUserInstanceController";
import { requireAuth } from "@/http/middlewares/authMiddleware";

const router = Router();

/**
 * Delete a user's instance for a specific archetype.
 * Only the owner of the instance can delete it.
 */
router.delete(
  "/archetypes/:archetypeId/users/:userId/instance",
  requireAuth,
  deleteUserInstanceController
);

export default router;
