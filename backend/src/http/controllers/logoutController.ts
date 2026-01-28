import { Request, Response } from "express";
import { auth } from "@/lib/auth";

export const logoutController = async (req: Request, res: Response) => {
  try {
    // Use BetterAuth's signOut endpoint to properly clear session
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value[0] : value);
      }
    });

    const response = await auth.api.signOut({
      headers,
      asResponse: true,
    });

    // Copy BetterAuth cookies to response
    if (response.headers) {
      const setCookieHeaders = response.headers.getSetCookie();
      setCookieHeaders.forEach((cookie) => {
        res.append("Set-Cookie", cookie);
      });
    }

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
