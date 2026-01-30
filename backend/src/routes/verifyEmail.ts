import express from "express";
import { auth } from "@/lib/auth.js";

const router = express.Router();

// Verify email with token
router.get("/", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Use BetterAuth's verify email functionality
    const result = await auth.api.verifyEmail({
      body: { token },
    });

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify email. Please try again or request a new verification link.",
    });
  }
});

export default router;
