import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  admin?: {
    adminId: number;
    username: string;
  };
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as { adminId: number; username: string };
      (req as AuthenticatedRequest).admin = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.error("[authMiddleware] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "An error occurred during authentication",
    });
  }
};
