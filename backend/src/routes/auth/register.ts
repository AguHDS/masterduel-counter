import express from "express";
import validatorRegistration from "@/http/middlewares/express-validator/registrationValidator";
import { registerUserMiddleware } from "@/http/middlewares/auth/registerUserMiddleware";
import { registerUserController } from "@/http/controllers/auth/registerUserController";

const router = express.Router();

router.post(
  "/",
  validatorRegistration,
  registerUserMiddleware,
  registerUserController,
);

export default router;
