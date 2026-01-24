import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { AuthService } from "@/application/ports/AuthService";

let authService: AuthService | null = null;

const getAuthService = (): AuthService => {
  if (!authService) {
    const dependencies = getDependencies();
    authService = dependencies.getAuthService();
  }
  return authService;
};

export const signAsAdminController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { username, password } = req.body;

    const service = getAuthService();
    const result = await service.login({ username, password });

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" as const : "lax" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    };

    res.cookie("adminToken", result.token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: result.message,
      admin: result.admin,
    });
  } catch (error) {
    console.error("[Sign As Admin Controller Error]:", error);

    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "An error occurred during authentication",
    });
  }
};
