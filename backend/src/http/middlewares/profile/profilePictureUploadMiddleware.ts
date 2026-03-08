import { Request, Response, NextFunction } from "express";

export const profilePictureUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
    return;
  }

  // Validate file type
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    res.status(400).json({
      success: false,
      message: "Invalid file type. Only JPEG, PNG, and WebP are allowed",
    });
    return;
  }

  next();
};
