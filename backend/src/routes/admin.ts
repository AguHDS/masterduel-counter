import { Router } from "express";
import {
  getUserMiddleware,
  searchUserMiddleware,
} from "@/http/middlewares/index.js";
import {
  banUserController,
  changeUserCredentialsController,
  changeUserRoleController,
  deleteGuideRequestController,
  deleteReportController,
  deleteUserController,
  deleteUserGuideController,
  getReportsController,
  getUserController,
  getUserGuidesController,
  searchUsersController,
  unbanUserController,
  getTotalUsersController,
  getAllUsersController,
  getArchetypesAdminController,
  createArchetypeAdminController,
  deleteArchetypeAdminController,
  updateArchetypeAdminController,
  getServerStateController,
  startServerTaskController,
  cancelServerTaskController,
  setServerMaintenanceController,
  restartServerController,
} from "@/http/controllers/admin/index.js";
import {
  deleteUserMiddleware,
  getUserGuidesMiddleware,
  verifyAdminMiddleware,
} from "@/http/middlewares/admin/index.js";

const router = Router();

// User search and management
router.get(
  "/users/search",
  verifyAdminMiddleware,
  searchUserMiddleware,
  searchUsersController,
);
router.get(
  "/users/:userId",
  verifyAdminMiddleware,
  getUserMiddleware,
  getUserController,
);
router.delete(
  "/users/:userId",
  verifyAdminMiddleware,
  deleteUserMiddleware,
  deleteUserController,
);
router.get(
  "/users/:userId/instances",
  verifyAdminMiddleware,
  getUserGuidesMiddleware,
  getUserGuidesController,
);
router.delete(
  "/users/:userId/instances/:instanceId",
  verifyAdminMiddleware,
  deleteUserGuideController,
);
router.put(
  "/users/:userId/credentials",
  verifyAdminMiddleware,
  changeUserCredentialsController,
);
router.put(
  "/users/:userId/role",
  verifyAdminMiddleware,
  changeUserRoleController,
);
router.put("/users/:userId/ban", verifyAdminMiddleware, banUserController);
router.put("/users/:userId/unban", verifyAdminMiddleware, unbanUserController);

// Reports
router.get("/reports", verifyAdminMiddleware, getReportsController);
router.delete(
  "/reports/:reportId",
  verifyAdminMiddleware,
  deleteReportController,
);

router.delete(
  "/guide-requests/:requestId",
  verifyAdminMiddleware,
  deleteGuideRequestController,
);

// Tracking
router.get(
  "/tracking/total-users",
  verifyAdminMiddleware,
  getTotalUsersController,
);
router.get("/tracking/users", verifyAdminMiddleware, getAllUsersController);

// Archetypes management
router.get("/archetypes", verifyAdminMiddleware, getArchetypesAdminController);
router.post("/archetypes", verifyAdminMiddleware, createArchetypeAdminController);
router.delete("/archetypes/:id", verifyAdminMiddleware, deleteArchetypeAdminController);
router.put("/archetypes/:id", verifyAdminMiddleware, updateArchetypeAdminController);

// Server Management
router.get("/server/state", verifyAdminMiddleware, getServerStateController);
router.post("/server/tasks", verifyAdminMiddleware, startServerTaskController);
router.post(
  "/server/tasks/:id/cancel",
  verifyAdminMiddleware,
  cancelServerTaskController,
);
router.put("/server/maintenance", verifyAdminMiddleware, setServerMaintenanceController);
router.post("/server/restart", verifyAdminMiddleware, restartServerController);

export default router;
