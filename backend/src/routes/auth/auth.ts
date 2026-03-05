import express from "express";
import { auth } from "@/lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import registerRouter from "./register.js";
import loginRouter from "./login.js";
import verifyEmailRouter from "./verifyEmail.js";

const router = express.Router();

// Custom routes
router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/verify-email", verifyEmailRouter);

// Handle all BetterAuth routes (including change-password)
router.use(toNodeHandler(auth));

export default router;
