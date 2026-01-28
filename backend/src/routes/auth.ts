import express from "express";
import { auth } from "@/lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import registerRouter from "./register";
import loginRouter from "./login";

const router = express.Router();

router.use("/register", registerRouter);
router.use("/login", loginRouter);

// Handle all other BetterAuth routes
router.use(toNodeHandler(auth));

export default router;
