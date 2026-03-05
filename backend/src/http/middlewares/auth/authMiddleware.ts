import { Request, Response, NextFunction } from "express";
import { auth } from "@/lib/auth.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to verify user authentication using BetterAuth session
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Convert Express headers to Web API Headers format
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value[0] : value);
      }
    });

    // Get session from BetterAuth
    const session = await auth.api.getSession({
      headers,
    });

    if (!session || !session.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "You must be logged in to perform this action",
      });
      return;
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user as { role?: string }).role || "user",
    };

    next();
  } catch (error) {
    console.error("[Auth Middleware Error]:", error);
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Invalid or expired session",
    });
  }
};
