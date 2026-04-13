import { PrismaClient } from "@prisma/client";

const USERNAME_CHANGE_COOLDOWN_DAYS = 7;
const USERNAME_CHANGE_COOLDOWN_MS = USERNAME_CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export class ChangeUsernameError extends Error {
  constructor(
    public readonly code:
      | "USER_NOT_FOUND"
      | "USERNAME_TAKEN"
      | "SAME_USERNAME"
      | "USERNAME_CHANGE_COOLDOWN",
    public readonly metadata?: {
      nextAllowedChangeAt?: string;
      remainingDays?: number;
    },
  ) {
    super(code);
    this.name = "ChangeUsernameError";
  }
}

export class ChangeUsernameWithBetterAuthApplicationService {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(userId: string, newUsername: string): Promise<{
    username: string;
    nextAllowedChangeAt: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        lastUsernameChange: true,
      },
    });

    if (!user) {
      throw new ChangeUsernameError("USER_NOT_FOUND");
    }

    if (user.name === newUsername) {
      throw new ChangeUsernameError("SAME_USERNAME");
    }

    if (user.lastUsernameChange) {
      const nextAllowedChangeAt = new Date(
        user.lastUsernameChange.getTime() + USERNAME_CHANGE_COOLDOWN_MS,
      );

      if (Date.now() < nextAllowedChangeAt.getTime()) {
        const remainingMs = nextAllowedChangeAt.getTime() - Date.now();
        const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

        throw new ChangeUsernameError("USERNAME_CHANGE_COOLDOWN", {
          nextAllowedChangeAt: nextAllowedChangeAt.toISOString(),
          remainingDays,
        });
      }
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        name: newUsername,
        id: { not: userId },
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new ChangeUsernameError("USERNAME_TAKEN");
    }

    const usernameChangedAt = new Date();

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: newUsername,
        lastUsernameChange: usernameChangedAt,
      },
      select: {
        name: true,
      },
    });

    return {
      username: updatedUser.name,
      nextAllowedChangeAt: new Date(
        usernameChangedAt.getTime() + USERNAME_CHANGE_COOLDOWN_MS,
      ).toISOString(),
    };
  }
}
