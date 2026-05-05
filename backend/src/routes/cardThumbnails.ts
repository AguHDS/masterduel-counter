import { Router } from "express";
import { getThumbnail } from "../http/controllers/cardImageThumbnailController.js";

const router = Router();

/**
 * Generate thumbnails for cropped card images on demand
 */
router.get("/cards/thumb/:filename", getThumbnail);

export default router;
