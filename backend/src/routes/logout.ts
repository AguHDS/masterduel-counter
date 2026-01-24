import express from "express";
import { logoutController } from "../http/controllers/logoutController";

const router = express.Router();

router.post("/", logoutController);

export default router;
