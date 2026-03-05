import express from "express";
import validatorLogin from "@/http/middlewares/express-validator/loginValidator.js";
import { loginUserMiddleware } from "@/http/middlewares/auth/loginUserMiddleware.js";
import { loginUserController } from "@/http/controllers/auth/loginUserController.js";

const router = express.Router();

router.post("/", validatorLogin, loginUserMiddleware, loginUserController);

export default router;
