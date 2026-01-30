import express from "express";
import { auth } from "@/lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import registerRouter from "./register";
import loginRouter from "./login";
import verifyEmailRouter from "./verifyEmail";

const router = express.Router();

// Custom routes
router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/verify-email", verifyEmailRouter);

// Handle all other BetterAuth routes
router.use(toNodeHandler(auth));

export default router;
