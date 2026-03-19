import { Request, Response } from "express";
import { RegisterUserWithBetterAuthApplicationService } from "@/application/services/RegisterUserWithBetterAuthApplicationService.js";
import { SqliteUserRepository } from "@/infrastructure/repositories/SqliteUserRepository.js";
import { PrismaClient } from "@prisma/client";
import { verifyTurnstileToken } from "@/services/turnstile.js";

/** Registers a new user */
// Dependency injection
const prisma = new PrismaClient();
const registerUserUseCase = new RegisterUserWithBetterAuthApplicationService(
  new SqliteUserRepository(prisma),
);

type BetterAuthErrorBody = {
  message?: string;
  errors?: Array<string | { message?: string }>;
  code?: string;
};

type BetterAuthError = {
  body?: BetterAuthErrorBody;
  statusCode?: number;
};

const getBetterAuthErrorMessage = (
  errors?: Array<string | { message?: string }>,
): string | undefined => {
  if (!errors || !Array.isArray(errors) || errors.length === 0)
    return undefined;

  const firstError = errors[0];

  if (typeof firstError === "string") return firstError;
  if (firstError && typeof firstError === "object" && "message" in firstError) {
    return firstError.message;
  }

  return undefined;
};

/** Register new user with BetterAuth */
export const registerUserController = async (req: Request, res: Response) => {
  if (!req.userSession) {
    res
      .status(400)
      .json({ message: "Invalid request: missing user session data" });
    return;
  }

  const { user, email, password } = req.userSession;
  const { turnstileToken } = req.body;

  // Verify CAPTCHA token
  if (!turnstileToken) {
    res.status(400).json({ message: "CAPTCHA verification is required" });
    return;
  }

  const isCaptchaValid = await verifyTurnstileToken(turnstileToken);
  if (!isCaptchaValid) {
    res.status(400).json({ message: "CAPTCHA verification failed. Please try again." });
    return;
  }

  try {
    // Register user without auto-login (user must explicitly login after registration)
    const result = await registerUserUseCase.execute(user, email, password);

    console.log(`User: ${user} registered successfully`);

    res.status(201).json({
      message: "Registration completed",
      user: result.user,
    });
  } catch (error) {
    // BetterAuth error handling
    if (error && typeof error === "object" && "body" in error) {
      const betterAuthError = error as BetterAuthError;

      const statusCode = betterAuthError.statusCode || 400;
      let errorMessage = "Registration failed";

      const body = betterAuthError.body;

      if (body?.errors) {
        errorMessage = getBetterAuthErrorMessage(body.errors) ?? errorMessage;
      } else if (body?.message) {
        errorMessage = body.message;
      }

      res.status(statusCode).json({
        message: errorMessage,
        error: errorMessage,
      });
      return;
    }

    // Domain / use case errors
    if (error instanceof Error) {
      switch (error.message) {
        case "USERNAME_TAKEN":
          console.error(`Username ${user} already exists`);
          res.status(409).json({ message: "Username already taken" });
          return;
        case "EMAIL_TAKEN":
          console.error(`Email ${email} already exists`);
          res.status(409).json({ message: "Email already taken" });
          return;
        case "USERNAME_AND_EMAIL_TAKEN":
          console.error(`Username ${user} and email ${email} already exist`);
          res
            .status(409)
            .json({ message: "Username and email are already taken" });
          return;
        case "REGISTRATION_FAILED":
          console.error("Failed to create user with BetterAuth");
          res.status(500).json({ message: "Failed to create user" });
          return;
      }
    }

    console.error("Unexpected error during registration:", error);
    res.status(500).json({ message: "Error trying to sign up" });
  }
};
