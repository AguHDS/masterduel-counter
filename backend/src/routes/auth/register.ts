import express from "express";
import validatorRegistration from "@/http/middlewares/express-validator/registrationValidator.js";
import { registerUserMiddleware } from "@/http/middlewares/auth/registerUserMiddleware.js";
import { registerUserController } from "@/http/controllers/auth/registerUserController.js";

const router = express.Router();

router.post(
  "/",
  validatorRegistration,
  registerUserMiddleware,
  registerUserController,
);

export default router;
