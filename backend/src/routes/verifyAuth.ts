import express from "express";
import { authMiddleware } from "../http/middlewares/authMiddleware";
import { verifyAuthController } from "../http/controllers/verifyAuthController";

const router = express.Router();

router.get("/", authMiddleware, verifyAuthController);

export default router;
