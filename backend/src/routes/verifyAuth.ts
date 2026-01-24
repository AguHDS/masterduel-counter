import express from "express";
import { verifyAdminAuthMiddleware } from "../http/middlewares/verifyAdminAuthMiddleware";
import { verifyAdminAuthController } from "../http/controllers/verifyAdminAuthController";

const router = express.Router();

router.get("/", verifyAdminAuthMiddleware, verifyAdminAuthController);

export default router;
