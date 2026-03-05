import express from "express";
import { logoutController } from "@/http/controllers/auth/logoutController.js";

const router = express.Router();

router.post("/", logoutController);

export default router;
