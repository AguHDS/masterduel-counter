import express from "express";
import validatorLogin from "../http/middlewares/express-validator/loginValidator";
import { loginUserMiddleware } from "../http/middlewares/loginUserMiddleware";
import { loginUserController } from "../http/controllers/loginUserController";

const router = express.Router();

router.post("/", validatorLogin, loginUserMiddleware, loginUserController);

export default router;
