import {
  AdminRepository,
  AdminUserSearchResult,
} from "@/domain/ports/AdminRepository";
import { PrismaClient } from "@prisma/client";

export class SqliteAdminRepository implements AdminRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async searchUsersAdminPanel(
    query: string,
    limit: number = 10,
  ): Promise<AdminUserSearchResult[]> {
    const queryLower = `%${query.toLowerCase()}%`;

    const users = await this.prisma.$queryRaw<
      Array<{
        id: string;
        namedb: string;
        emaildb: string;
        role: string;
        created_at: Date;
        banned: boolean | null;
        ban_reason: string | null;
        ban_expires: Date | null;
      }>
    >`
      SELECT id, namedb, emaildb, role, created_at, banned, ban_reason, ban_expires
      FROM users
      WHERE LOWER(namedb) LIKE ${queryLower}
         OR LOWER(emaildb) LIKE ${queryLower}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return users.map((user) => ({
      id: user.id,
      username: user.namedb,
      email: user.emaildb,
      role: user.role,
      created_at: user.created_at.toISOString(),
      is_banned: user.banned || false,
      ban_reason: user.ban_reason || null,
      ban_expires: user.ban_expires?.toISOString() || null,
    }));
  }

  async getUserByIdAdminPanel(
    userId: string,
  ): Promise<AdminUserSearchResult | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        banned: true,
        banReason: true,
        banExpires: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.name,
      email: user.email,
      role: user.role,
      created_at: user.createdAt.toISOString(),
      is_banned: user.banned || false,
      ban_reason: user.banReason || null,
      ban_expires: user.banExpires?.toISOString() || null,
    };
  }

  async deleteUser(userId: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        // Get unique archetypeIds from the user's instances
        const userInstances = await tx.archetypeInstance.findMany({
          where: { userId },
          select: { archetypeId: true },
        });

        const archetypeIds = [
          ...new Set(userInstances.map((instance) => instance.archetypeId)),
        ];

        // Delete user (cascades to related instances and likes)
        await tx.user.delete({
          where: { id: userId },
        });

        // Check affected archetypes after deletion
        for (const archetypeId of archetypeIds) {
          const remainingInstancesCount = await tx.archetypeInstance.count({
            where: { archetypeId },
          });

          // If no instances remain, mark archetype as unregistered
          if (remainingInstancesCount === 0) {
            await tx.archetype.update({
              where: { id: archetypeId },
              data: { registered: false },
            });
          }
        }

        // remove any remaining likes if cascade failed
        const remainingLikes = await tx.instanceLike.count({
          where: { userId },
        });

        if (remainingLikes > 0) {
          await tx.instanceLike.deleteMany({
            where: { userId },
          });
        }
      },
      {
        maxWait: 20000,
        timeout: 60000,
      },
    );
  }
}
