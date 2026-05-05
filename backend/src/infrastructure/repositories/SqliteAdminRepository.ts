import { PrismaClient } from "@prisma/client";
import { AdminRepository } from "@/domain/ports/AdminRepository.js";
import { hashPassword } from "better-auth/crypto";
import type { UserSearchResult } from "@/shared/dtos/userDto.js";
import type { InstanceGuideResultAdminPanel } from "@/domain/ports/AdminRepository.js";
import type { ReportWithDetails } from "@/domain/Report.js";

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
        // 0. Get user's profile picture info for Cloudinary deletion
        const profile = await tx.profile.findUnique({
          where: { userId },
          select: { cloudinaryPublicId: true },
        });

        // Delete profile picture from Cloudinary if it exists
        if (profile?.cloudinaryPublicId) {
          try {
            // Import cloudinary dynamically to avoid circular dependencies
            const { cloudinary } = await import("@/services/cloudinary.js");
            await cloudinary.uploader.destroy(profile.cloudinaryPublicId);
          } catch (error) {
            console.error(
              "Error deleting profile picture from Cloudinary:",
              error,
            );
            // Continue with user deletion even if Cloudinary deletion fails
          }
        }

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

  async getUserGuidesAdminPanel(
    userId: string,
  ): Promise<InstanceGuideResultAdminPanel[]> {
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

  async deleteUserGuide(userId: string, guideId: number): Promise<void> {
    // Verify the guide belongs to the user
    const guide = await this.prisma.archetypeInstance.findUnique({
      where: { id: guideId },
    });

    if (!guide) {
      throw new Error("Guide not found");
    }

    if (guide.userId !== userId) {
      throw new Error("Guide does not belong to this user");
    }

    // Delete the guide (cascade will handle related data)
    await this.prisma.archetypeInstance.delete({
      where: { id: guideId },
    });

    // Check if archetype should be unregistered
    const remainingInstances = await this.prisma.archetypeInstance.count({
      where: { archetypeId: guide.archetypeId },
    });

    if (remainingInstances === 0) {
      await this.prisma.archetype.update({
        where: { id: guide.archetypeId },
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

    // Update name if provided
    if (credentials.username) {
      updateData.name = credentials.username;
    }

    // Update email if provided
    if (credentials.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error("Email already in use");
      }

      updateData.email = credentials.email;
    }

    // Update basic user data if there are changes
    if (Object.keys(updateData).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Update password if provided
    if (credentials.password) {
      const hashedPassword = await hashPassword(credentials.password);

      // Update password in the Account table for the "credential" provider
      const result = await this.prisma.account.updateMany({
        where: {
          userId: userId,
          providerId: "credential",
        },
        data: {
          password: hashedPassword,
        },
      });

      // If no account was updated, it means the user does not have a credential account
      if (result.count === 0) {
        throw new Error("User does not have a credential account");
      }
    }
  }

  async changeUserRole(userId: string, role: string): Promise<void> {
    // Validate role
    const validRoles = ["user", "supporter", "admin"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    // Update user role
    await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
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
            archetypeId: true,
            guideType: true,
            archetype: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
              },
            },
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
      reportedInstanceAuthorId: report.reportedInstance?.user?.id || null,
      reportedInstanceAuthorName: report.reportedInstance?.user?.name || null,
      reportedInstanceArchetypeId: report.reportedInstance?.archetypeId || null,
      reportedInstanceArchetypeName: report.reportedInstance?.archetype?.name || null,
      reportedInstanceGuideType:
        (report.reportedInstance?.guideType as "COUNTER" | "DECK" | null) || null,
    }));
  }

  async deleteReport(reportId: number): Promise<void> {
    await this.prisma.report.delete({
      where: { id: reportId },
    });
  }

  async deleteGuideRequest(requestId: number): Promise<void> {
    await this.prisma.guideRequest.delete({
      where: { id: requestId },
    });
  }

  async getTotalUsers(): Promise<number> {
    const count = await this.prisma.user.count();
    return count;
  }

  /** Get all users with pagination */
  async getAllUsersPaginated(
    page: number,
    limit: number,
    sortBy: "created_at" | "name" | "email" = "created_at",
    sortOrder: "asc" | "desc" = "desc",
    search?: string,
  ): Promise<{
    users: UserSearchResult[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {};

    const total = await this.prisma.user.count({ where });
    const users = await this.prisma.user.findMany({
      where,
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
      orderBy: {
        [sortBy === "name"
          ? "name"
          : sortBy === "email"
            ? "email"
            : "createdAt"]: sortOrder,
      },
      skip,
      take: limit,
    });

    return {
      users: users.map((user) => ({
        id: user.id,
        username: user.name,
        email: user.email,
        role: user.role,
        created_at: user.createdAt.toISOString(),
        is_banned: user.banned || false,
        ban_reason: user.banReason || null,
        ban_expires: user.banExpires?.toISOString() || null,
      })),
      total,
    };
  }
}
