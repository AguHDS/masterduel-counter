import express from "express";
import validatorLogin from "@/http/middlewares/express-validator/loginValidator";
import { loginUserMiddleware } from "@/http/middlewares/auth/loginUserMiddleware";
import { loginUserController } from "@/http/controllers/auth/loginUserController";

const router = express.Router();

router.post("/", validatorLogin, loginUserMiddleware, loginUserController);

export default router;
