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

const router = Router();

// User
router.get("/users/:userId", getUserController);
router.delete("/users/:userId", deleteUserController);
router.get("/users/:userId/instances", getUserInstancesController);
router.delete("/users/:userId/instances/:instanceId", deleteUserInstanceController);
router.put("/users/:userId/credentials", changeUserCredentialsController);
router.put("/users/:userId/ban", banUserController);
router.put("/users/:userId/unban", unbanUserController);

// Reports
router.get("/reports", getReportsController);
router.delete("/reports/:reportId", deleteReportController);

export default router;
