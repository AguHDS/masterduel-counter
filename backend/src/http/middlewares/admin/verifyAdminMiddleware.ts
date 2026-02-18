import { Request, Response, NextFunction } from "express";
import {
  requireAuth,
  AuthenticatedRequest,
} from "@/http/middlewares/auth/authMiddleware";

export interface AdminRequest extends AuthenticatedRequest {
  adminUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware that first checks authentication, then verifies admin role
 */
export const verifyAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Primero verificar autenticación
  requireAuth(req, res, (err?: unknown) => {
    if (err) {
      return next(err);
    }

    if (res.headersSent) return;

    const authenticatedReq = req as AuthenticatedRequest;

    if (authenticatedReq.user?.role !== "admin") {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Administrator privileges required",
      });
      return;
    }

    (req as AdminRequest).adminUser = authenticatedReq.user;
    next();
  });
};
