import { Request, Response } from "express";

export const logoutController = async (
  req: Request,
  res: Response,
) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("[Logout Controller Error]:", error);

    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "An error occurred during logout",
    });
  }
};
