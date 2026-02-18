import express from "express";
import { searchArchetypeMiddleware } from "@/http/middlewares/archetypes/searchArchetypeMiddleware";
import { searchArchetypeController } from "@/http/controllers/archetypes/searchArchetypeController";

const router = express.Router();

router.get("/", searchArchetypeMiddleware, searchArchetypeController);

export default router;
