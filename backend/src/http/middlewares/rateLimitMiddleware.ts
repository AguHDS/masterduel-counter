import { Request, Response, NextFunction } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { auth } from "@/lib/auth.js";

/**
 * Helper function to get user identifier for rate limiting
 * - Uses userId if authenticated (prevents NAT issues)
 * - Falls back to IP address for anonymous users
 */
const getUserIdentifier = async (req: Request): Promise<string> => {
  try {
    // Try to get authenticated user session
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value[0] : value);
      }
    });

    const session = await auth.api.getSession({ headers });

    if (session?.user?.id) {
      return `user:${session.user.id}`;
    }
  } catch {
    // If auth fails, fall through to IP-based rate limiting
  }

  // For anonymous users, use IP address
  // Nginx passes real IP via X-Forwarded-For header
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" 
    ? forwarded.split(",")[0].trim() 
    : req.ip || "unknown";

  return `ip:${ip}`;
};

/**
 * Creates a rate limiter with custom key generator that uses getUserIdentifier
 */
const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string,
): RateLimitRequestHandler => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, error: "Too many requests", message },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // Use custom key generator based on authentication status
    keyGenerator: async (req: Request): Promise<string> => {
      return await getUserIdentifier(req);
    },
    // Skip rate limiting for requests that already failed (e.g., 404, 500)
    skip: (_req: Request, res: Response): boolean => {
      return res.statusCode >= 400;
    },
  });
};

/**
 * Authentication write operations (login, register, password reset)
 * 10 requests per 15 minutes
 * Prevents brute force attacks and email spam
 */
export const authWriteRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10,
  "Too many authentication attempts. Please try again in 15 minutes.",
);

/**
 * Content creation for authenticated users (reports, etc.)
 * 50 requests per hour
 */
const contentCreationAuthRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  50,
  "Too many content creation requests. Please try again later.",
);

/**
 * Content creation for anonymous users (reports, etc.)
 * 20 requests per hour - more restrictive
 */
const contentCreationAnonRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  20,
  "Too many requests. Please log in for higher limits or try again later.",
);

/**
 * Middleware to apply different rate limits based on authentication status
 */
const createDynamicRateLimiter = (
  authLimiter: RateLimitRequestHandler,
  anonLimiter: RateLimitRequestHandler,
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      const headers = new Headers();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, Array.isArray(value) ? value[0] : value);
        }
      });

      const session = await auth.api.getSession({ headers });
      const isAuthenticated = !!session?.user;

      // Apply appropriate rate limiter
      const limiter = isAuthenticated ? authLimiter : anonLimiter;
      limiter(req, res, next);
    } catch {
      // If auth check fails, treat as anonymous
      anonLimiter(req, res, next);
    }
  };
};

/**
 * Dynamic rate limiter for content creation (used for reports)
 * Applies higher limits for authenticated users
 */
export const dynamicContentCreationRateLimiter = createDynamicRateLimiter(
  contentCreationAuthRateLimiter,
  contentCreationAnonRateLimiter,
);
