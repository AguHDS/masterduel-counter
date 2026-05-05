import { Request, Response } from "express";
import { CardImageThumbnailService } from "@/services/cardImageThumbnailService.js";

const thumbnailService = new CardImageThumbnailService();

/**
 * Serves thumbnail versions of cropped card images (for mini cropped images)
 * Thumbnails are generated on-demand and cached for subsequent requests
 */
export const getThumbnail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;

    // Ensure filename is a string (Express params can be string | string[])
    if (!filename || typeof filename !== 'string') {
      res.status(400).json({ error: "Invalid filename parameter" });
      return;
    }

    // Parse filename: {cardId}_{width}x{height}.jpg
    const match = filename.match(/^(\d+)_(\d+)x(\d+)\.jpg$/);
    
    if (!match) {
      res.status(400).json({ 
        error: "Invalid thumbnail filename format. Expected: {cardId}_{width}x{height}.jpg" 
      });
      return;
    }

    const cardId = parseInt(match[1], 10);
    const width = parseInt(match[2], 10);
    const height = parseInt(match[3], 10);

    // Validate dimensions (prevent abuse)
    if (width > 500 || height > 500 || width < 10 || height < 10) {
      res.status(400).json({ 
        error: "Invalid dimensions. Width and height must be between 10 and 500 pixels" 
      });
      return;
    }

    // Generate or retrieve cached thumbnail
    const thumbnailBuffer = await thumbnailService.getThumbnail(cardId, { width, height });

    // Set appropriate cache headers
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      'Content-Length': thumbnailBuffer.length,
    });

    res.send(thumbnailBuffer);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: "Card image not found" });
      return;
    }

    console.error("Error generating thumbnail:", error);
    res.status(500).json({ error: "Failed to generate thumbnail" });
  }
};
