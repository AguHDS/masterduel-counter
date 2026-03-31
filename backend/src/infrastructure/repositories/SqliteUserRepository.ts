import { UserRepository } from "@/domain/ports/UserRepository.js";
import { User } from "@/domain/User.js";
import { PrismaClient } from "@prisma/client";

export class SqliteUserRepository implements UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findUserByUsername(username: string): Promise<User | null> {
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

  async findUserById(id: string): Promise<User | null> {
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

  async searchUsersByUsername(query: string, limit: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        name: {
          contains: query,
        },
        banned: {
          not: true,
        },
      },
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      username: user.name,
      email: user.email,
      role: user.role,
      created_at: user.createdAt.toISOString(),
    }));
  }
}
