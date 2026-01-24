import { Request, Response, NextFunction } from "express";

export const signAsAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing credentials",
        message: "Username and password are required",
      });
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid parameter format",
        message: "Username and password must be strings",
      });
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (trimmedUsername.length === 0 || trimmedPassword.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Empty credentials",
        message: "Username and password cannot be empty",
      });
    }

    if (trimmedUsername.length > 50) {
      return res.status(400).json({
        success: false,
        error: "Username too long",
        message: "Username cannot exceed 50 characters",
      });
    }

    if (trimmedPassword.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Password too long",
        message: "Password cannot exceed 100 characters",
      });
    }

    next();
  } catch (error) {
    console.error("[signAsAdminMiddleware] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "An error occurred while validating the request",
    });
  }
};
