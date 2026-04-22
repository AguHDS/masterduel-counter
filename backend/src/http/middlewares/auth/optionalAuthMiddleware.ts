import { Request, Response, NextFunction } from "express";
import { auth } from "@/lib/auth.js";
import type { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";

/**
 * Optional auth middleware — attaches user info to request if a valid session exists, but doesn't reject non-authenticated requests
 */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value[0] : value);
      }
    });

    const session = await auth.api.getSession({ headers });

    if (session?.user) {
      (req as AuthenticatedRequest).user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as { role?: string }).role ?? "user",
      };
    }
  } catch {
    // Ignore auth errors — user stays unauthenticated
  }

  next();
};
