import { Router } from "express";
import { getUserController } from "@/http/controllers/admin/getUserController";
import { deleteUserController } from "@/http/controllers/admin/deleteUserController";
import { getUserInstancesController } from "@/http/controllers/admin/getUserInstancesController";
import { deleteUserInstanceController } from "@/http/controllers/admin/deleteUserInstanceController";
import { changeUserCredentialsController } from "@/http/controllers/admin/changeUserCredentialsController";
import { banUserController } from "@/http/controllers/admin/banUserController";
import { unbanUserController } from "@/http/controllers/admin/unbanUserController";
import { getReportsController } from "@/http/controllers/admin/getReportsController";
import { deleteReportController } from "@/http/controllers/admin/deleteReportController";
import { searchUsersController } from "@/http/controllers/admin/searchUsersController";
import { verifyAdminMiddleware } from "@/http/middlewares/admin/verifyAdminMiddleware";
import { getUserMiddleware } from "@/http/middlewares/getUserMiddleware";
import { searchUserMiddleware } from "@/http/middlewares/searchUserMiddleware";
import { deleteUserMiddleware } from "@/http/middlewares/admin/deleteUserMiddleware";

const router = Router();
// User
router.get("/users/search", verifyAdminMiddleware, searchUserMiddleware, searchUsersController);
router.get("/users/:userId", verifyAdminMiddleware, getUserMiddleware, getUserController);
router.delete("/users/:userId", verifyAdminMiddleware, deleteUserMiddleware,deleteUserController);
router.get("/users/:userId/instances", verifyAdminMiddleware, getUserInstancesController);
router.delete("/users/:userId/instances/:instanceId", verifyAdminMiddleware, deleteUserInstanceController);
router.put("/users/:userId/credentials", verifyAdminMiddleware, changeUserCredentialsController);
router.put("/users/:userId/ban", verifyAdminMiddleware, banUserController);
router.put("/users/:userId/unban", verifyAdminMiddleware, unbanUserController);

// Reports
router.get("/reports", verifyAdminMiddleware, getReportsController);
router.delete("/reports/:reportId", verifyAdminMiddleware, deleteReportController);

export default router;
