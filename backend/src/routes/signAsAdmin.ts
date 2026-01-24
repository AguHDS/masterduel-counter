import express from "express";
import { signAsAdminMiddleware } from "../http/middlewares/signAsAdminMiddleware";
import { signAsAdminController } from "../http/controllers/signAsAdminController";

const router = express.Router();

router.post("/", signAsAdminMiddleware, signAsAdminController);

export default router;
