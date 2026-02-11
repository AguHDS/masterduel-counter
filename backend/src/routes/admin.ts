import { Router } from "express";
import { getUserMiddleware, searchUserMiddleware } from "@/http/middlewares";
import {
  banUserController,
  changeUserCredentialsController,
  deleteReportController,
  deleteUserController,
  deleteUserInstanceController,
  getReportsController,
  getUserController,
  getUserInstancesController,
  searchUsersController,
  unbanUserController,
} from "@/http/controllers/admin";
import {
  deleteUserMiddleware,
  getUserInstancesMiddleware,
  verifyAdminMiddleware,
} from "@/http/middlewares/admin";

const router = Router();
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
  getUserInstancesMiddleware,
  getUserInstancesController,
);
router.delete(
  "/users/:userId/instances/:instanceId",
  verifyAdminMiddleware,
  deleteUserInstanceController,
);
router.put(
  "/users/:userId/credentials",
  verifyAdminMiddleware,
  changeUserCredentialsController,
);
router.put("/users/:userId/ban", verifyAdminMiddleware, banUserController);
router.put("/users/:userId/unban", verifyAdminMiddleware, unbanUserController);
router.get("/reports", verifyAdminMiddleware, getReportsController);
router.delete(
  "/reports/:reportId",
  verifyAdminMiddleware,
  deleteReportController,
);

export default router;
