import express from "express";
import validatorRegistration from "@/http/middlewares/express-validator/registrationValidator";
import { registerUserMiddleware } from "@/http/middlewares/registerUserMiddleware";
import { registerUserController } from "@/http/controllers/registerUserController";

const router = express.Router();

router.post(
  "/",
  validatorRegistration,
  registerUserMiddleware,
  registerUserController,
);

export default router;
