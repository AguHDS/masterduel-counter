import express from "express";
import { logoutController } from "@/http/controllers/auth/logoutController";

const router = express.Router();

router.post("/", logoutController);

export default router;
