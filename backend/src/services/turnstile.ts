interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn("⚠️ TURNSTILE_SECRET_KEY not configured - skipping CAPTCHA verification");
    return true; // Allow in development if not configured
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    if (!response.ok) {
      console.error("❌ Turnstile API request failed:", response.statusText);
      return false;
    }

    const data = await response.json() as TurnstileVerifyResponse;

    if (!data.success) {
      console.error("❌ Turnstile verification failed:", data["error-codes"]);
      return false;
    }

    console.log("✅ Turnstile verification successful");
    return true;
  } catch (error) {
    console.error("❌ Error verifying Turnstile token:", error);
    return false;
  }
}
