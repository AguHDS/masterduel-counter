import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  ChangeUsernameError,
  ChangeUsernameWithBetterAuthApplicationService,
} from "@/application/services/ChangeUsernameWithBetterAuthApplicationService.js";

const prisma = new PrismaClient();
const changeUsernameUseCase = new ChangeUsernameWithBetterAuthApplicationService(prisma);

export const changeUsernameController = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { username } = res.locals.changeUsernameData as {
    username?: string;
  };

  if (!username) {
    res.status(400).json({ message: "Username is required" });
    return;
  }

  try {
    const result = await changeUsernameUseCase.execute(req.user.id, username);

    res.status(200).json({
      success: true,
      message: "Username changed successfully",
      username: result.username,
      nextAllowedChangeAt: result.nextAllowedChangeAt,
    });
  } catch (error) {
    if (error instanceof ChangeUsernameError) {
      switch (error.code) {
        case "USERNAME_TAKEN":
          res.status(409).json({ message: "Username already taken" });
          return;
        case "SAME_USERNAME":
          res
            .status(400)
            .json({ message: "New username must be different from current one" });
          return;
        case "USERNAME_CHANGE_COOLDOWN":
          res.status(429).json({
            message: `You can change your username once every 7 days. Try again in ${error.metadata?.remainingDays ?? 0} day(s).`,
            nextAllowedChangeAt: error.metadata?.nextAllowedChangeAt,
            remainingDays: error.metadata?.remainingDays,
          });
          return;
        case "USER_NOT_FOUND":
          res.status(404).json({ message: "User not found" });
          return;
      }
    }

    console.error("Unexpected error changing username:", error);
    res.status(500).json({ message: "Failed to change username" });
  }
};
