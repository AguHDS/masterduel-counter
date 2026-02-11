import { AdminRepository } from "@/domain/ports/AdminRepository";
import type { UserSearchResult } from "@/shared/dtos/userDto";
import { PrismaClient } from "@prisma/client";
import { AdminInstanceResult } from "@/domain/ports/AdminRepository";
import type { ReportWithDetails } from "@/domain/Report";
import bcrypt from "bcrypt";

export class SqliteAdminRepository implements AdminRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async searchUsersAdminPanel(
    query: string,
    limit: number = 10,
  ): Promise<UserSearchResult[]> {
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
  ): Promise<UserSearchResult | null> {
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
        // 1. Obtener todos los instanceIds que le gustaron al usuario
        const userLikes = await tx.instanceLike.findMany({
          where: { userId },
          select: { instanceId: true },
        });

        const likedInstanceIds = userLikes.map((like) => like.instanceId);

        // 2. Obtener archetypeIds únicos de las instancias del usuario
        const userInstances = await tx.archetypeInstance.findMany({
          where: { userId },
          select: { archetypeId: true },
        });

        const archetypeIds = [
          ...new Set(userInstances.map((instance) => instance.archetypeId)),
        ];

        // 3. Actualizar contadores de likes en BATCH (más eficiente)
        if (likedInstanceIds.length > 0) {
          // Primero, obtener las instancias que aún existen
          const existingInstances = await tx.archetypeInstance.findMany({
            where: {
              id: { in: likedInstanceIds },
            },
            select: { id: true },
          });

          const existingInstanceIds = existingInstances.map((inst) => inst.id);

          if (existingInstanceIds.length > 0) {
            // Actualizar todas las instancias en una sola consulta
            await tx.$executeRaw`
            UPDATE archetype_instances 
            SET likes = CASE 
              WHEN likes > 0 THEN likes - 1 
              ELSE 0 
            END
            WHERE id IN (${existingInstanceIds.join(",")})
          `;
          }
        }

        // 4. Eliminar usuario (esto activa cascade para todo lo demás)
        await tx.user.delete({
          where: { id: userId },
        });

        // 5. Verificar archetypes después de la eliminación
        for (const archetypeId of archetypeIds) {
          const remainingInstancesCount = await tx.archetypeInstance.count({
            where: { archetypeId },
          });

          if (remainingInstancesCount === 0) {
            await tx.archetype.update({
              where: { id: archetypeId },
              data: { registered: false },
            });
          }
        }
      },
      {
        maxWait: 30000,
        timeout: 120000,
      },
    );
  }
  async getUserInstancesAdminPanel(
    userId: string,
  ): Promise<AdminInstanceResult[]> {
    const instances = await this.prisma.archetypeInstance.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        archetypeId: true,
        likes: true,
        createdAt: true,
        updatedAt: true,
        headerCardId: true,
        generalTip: true,
        archetype: {
          select: {
            name: true,
          },
        },
        headerCard: {
          select: {
            name: true,
            imageUrlCropped: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return instances.map((instance) => ({
      id: instance.id,
      title: instance.title,
      archetypeId: instance.archetypeId,
      archetypeName: instance.archetype.name,
      likes: instance.likes,
      created_at: instance.createdAt.toISOString(),
      updated_at: instance.updatedAt.toISOString(),
      headerCardId: instance.headerCardId,
      headerCardName: instance.headerCard?.name || null,
      headerCardImageUrl: instance.headerCard?.imageUrlCropped || null,
      generalTip: instance.generalTip,
    }));
  }

  async deleteUserInstance(
    userId: string,
    instanceId: number,
  ): Promise<void> {
    // Verify the instance belongs to the user
    const instance = await this.prisma.archetypeInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new Error("Instance not found");
    }

    if (instance.userId !== userId) {
      throw new Error("Instance does not belong to this user");
    }

    // Delete the instance (cascade will handle related data)
    await this.prisma.archetypeInstance.delete({
      where: { id: instanceId },
    });

    // Check if archetype should be unregistered
    const remainingInstances = await this.prisma.archetypeInstance.count({
      where: { archetypeId: instance.archetypeId },
    });

    if (remainingInstances === 0) {
      await this.prisma.archetype.update({
        where: { id: instance.archetypeId },
        data: { registered: false },
      });
    }
  }

  async changeUserCredentials(
    userId: string,
    credentials: { username?: string; email?: string; password?: string },
  ): Promise<void> {
    const updateData: {
      name?: string;
      email?: string;
    } = {};

    if (credentials.username) {
      updateData.name = credentials.username;
    }

    if (credentials.email) {
      // Check if email is already taken
      const existingUser = await this.prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error("Email already in use");
      }

      updateData.email = credentials.email;
    }

    // Update basic user data
    if (Object.keys(updateData).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Update password using bcrypt
    if (credentials.password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(credentials.password, saltRounds);
      
      // Update password in the account table
      await this.prisma.account.updateMany({
        where: {
          userId: userId,
          providerId: "credential",
        },
        data: {
          password: hashedPassword,
        },
      });
    }
  }

  async banUser(
    userId: string,
    reason: string,
    expiresAt?: Date | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        banned: true,
        banReason: reason,
        banExpires: expiresAt,
      },
    });
  }

  async unbanUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });
  }

  async getReports(): Promise<ReportWithDetails[]> {
    const reports = await this.prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
          },
        },
        reportedInstance: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reports.map((report) => ({
      id: report.id,
      reporterId: report.reporterId,
      reportedUserId: report.reportedUserId,
      reportedInstanceId: report.reportedInstanceId,
      reason: report.reason,
      status: report.status as "pending" | "resolved" | "dismissed",
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      reporterName: report.reporter.name,
      reporterEmail: report.reporter.email,
      reportedUserName: report.reportedUser?.name,
      reportedInstanceTitle: report.reportedInstance?.title,
    }));
  }

  async deleteReport(reportId: number): Promise<void> {
    await this.prisma.report.delete({
      where: { id: reportId },
    });
  }
}
