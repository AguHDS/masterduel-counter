import express from "express";
import { searchArchetypeMiddleware } from "@/http/middlewares/archetypes/searchArchetypeMiddleware.js";
import { searchArchetypeController } from "@/http/controllers/archetypes/searchArchetypeController.js";

const router = express.Router();

router.get("/", searchArchetypeMiddleware, searchArchetypeController);

export default router;
