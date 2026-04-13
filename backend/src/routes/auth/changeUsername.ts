import express from "express";
import { requireAuth } from "@/http/middlewares/auth/authMiddleware.js";
import changeUsernameValidator from "@/http/middlewares/express-validator/changeUsernameValidator.js";
import { changeUsernameMiddleware } from "@/http/middlewares/auth/changeUsernameMiddleware.js";
import { changeUsernameController } from "@/http/controllers/auth/changeUsernameController.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  changeUsernameValidator,
  changeUsernameMiddleware,
  changeUsernameController,
);

export default router;
