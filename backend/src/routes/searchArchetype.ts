import express from "express";
import { searchArchetypeMiddleware } from "../http/middlewares/searchArchetypeMiddleware";
import { searchArchetypeController } from "../http/controllers/searchArchetypeController";

const router = express.Router();

router.get("/", searchArchetypeMiddleware, searchArchetypeController);

export default router;
