import { UserRepository } from "@/domain/ports/UserRepository";
import { User } from "@/domain/User";
import { PrismaClient } from "@prisma/client";

export class SqliteUserRepository implements UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        name: username,
      },
    });

    if (!user) {
      return null;
    }

    // Get password from Account table
    const account = await this.prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    return {
      id: user.id,
      username: user.name,
      email: user.email,
      password_hash: account?.password || undefined,
      role: user.role,
      created_at: user.createdAt.toISOString(),
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    // Get password from Account table
    const account = await this.prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    return {
      id: user.id,
      username: user.name,
      email: user.email,
      password_hash: account?.password || undefined,
      role: user.role,
      created_at: user.createdAt.toISOString(),
    };
  }

  async isNameOrEmailTaken(
    username: string,
    email: string,
  ): Promise<{
    isTaken: boolean;
    userTaken: boolean;
    emailTaken: boolean;
  }> {
    const [userByName, userByEmail] = await Promise.all([
      this.prisma.user.findFirst({
        where: { name: username },
      }),
      this.prisma.user.findFirst({
        where: { email },
      }),
    ]);

    const userTaken = !!userByName;
    const emailTaken = !!userByEmail;

    return {
      isTaken: userTaken || emailTaken,
      userTaken,
      emailTaken,
    };
  }

  async deleteUserById(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map(
      (user): User => ({
        id: user.id,
        username: user.name,
        email: user.email,
        role: user.role,
        created_at: user.createdAt.toISOString(),
      }),
    );
  }

  async updateUserCredentials(
    id: string,
    updates: { username?: string; email?: string },
  ): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updates.username && { name: updates.username }),
        ...(updates.email && { email: updates.email }),
      },
    });

    return {
      id: updatedUser.id,
      username: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      created_at: updatedUser.createdAt.toISOString(),
    };
  }
}
