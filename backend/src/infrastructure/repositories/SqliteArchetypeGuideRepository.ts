import Database from "better-sqlite3";
import {
  Guide,
  GuideCreateDTO,
  GuideUpdateDTO,
  GuideListItem,
  GuideType,
} from "@/domain/Guide.js";
import {
  GuideRepository,
  LikeToggleResult,
} from "@/domain/ports/GuideRepository.js";
import { PrismaClient } from "@prisma/client";

export class SqliteArchetypeGuideRepository implements GuideRepository {
  constructor(
    private db: Database.Database,
    private prisma: PrismaClient,
  ) {}

  async createArchetypeInstance(
    data: GuideCreateDTO,
  ): Promise<Guide> {
    const stmt = this.db.prepare(`
      INSERT INTO archetype_instances (archetype_id, user_id, title, header_card_id, general_tip, guide_type, likes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      data.archetypeId,
      data.userId,
      data.title,
      data.headerCardId,
      data.generalTip || null,
      data.guideType,
    );

    return this.findArchetypeInstanceById(
      result.lastInsertRowid as number,
    ) as Promise<Guide>;
  }

  async findArchetypeInstanceById(
    id: number,
  ): Promise<Guide | null> {
    const stmt = this.db.prepare(`
      SELECT *
      FROM archetype_instances
      WHERE id = ?
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      guide_type: string;
      likes: number;
      favorites: number;
      views: number;
      created_at: string;
      updated_at: string;
    }

    const row = stmt.get(id) as InstanceRow | undefined;
    if (!row) return null;

    return {
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      guideType: row.guide_type as GuideType,
      likes: row.likes,
      favorites: row.favorites,
      views: row.views,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findArchetypeInstanceByArchetypeId(
    archetypeId: number,
    sortBy: "likes" | "updated" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : "ORDER BY ai.updated_at DESC, ai.likes DESC";

    const guideTypeFilter = guideType ? "AND ai.guide_type = ?" : "";
    const params = guideType ? [archetypeId, guideType] : [archetypeId];

    const stmt = this.db.prepare(`
      SELECT 
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        c.name as header_card_name,
        c.image_url_cropped as header_card_image_url
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      WHERE ai.archetype_id = ? ${guideTypeFilter}
      ${orderClause}
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      guide_type: string;
      likes: number;
      favorites: number;
      views: number;
      created_at: string;
      updated_at: string;
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      guideType: row.guide_type as GuideType,
      likes: row.likes,
      favorites: row.favorites,
      views: row.views,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async findArchetypeInstanceByUserId(
    userId: string,
    sortBy: "likes" | "updated" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : "ORDER BY ai.updated_at DESC, ai.likes DESC";

    const guideTypeFilter = guideType ? "AND ai.guide_type = ?" : "";
    const params = guideType ? [userId, guideType] : [userId];

    const stmt = this.db.prepare(`
      SELECT 
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        c.name as header_card_name,
        c.image_url_cropped as header_card_image_url
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      WHERE ai.user_id = ? ${guideTypeFilter}
      ${orderClause}
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      guide_type: string;
      likes: number;
      favorites: number;
      views: number;
      created_at: string;
      updated_at: string;
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      guideType: row.guide_type as GuideType,
      likes: row.likes,
      favorites: row.favorites,
      views: row.views,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async searchGuideItemList(
    archetypeId: number,
    title: string,
    sortBy: "likes" | "updated" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : "ORDER BY ai.updated_at DESC, ai.likes DESC";

    const guideTypeFilter = guideType ? "AND ai.guide_type = ?" : "";
    const params = guideType ? [archetypeId, `%${title}%`, guideType] : [archetypeId, `%${title}%`];

    const stmt = this.db.prepare(`
      SELECT 
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        c.name as header_card_name,
        c.image_url_cropped as header_card_image_url
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      WHERE ai.archetype_id = ? AND ai.title LIKE ? ${guideTypeFilter}
      ${orderClause}
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      guide_type: string;
      likes: number;
      favorites: number;
      views: number;
      created_at: string;
      updated_at: string;
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      guideType: row.guide_type as GuideType,
      likes: row.likes,
      favorites: row.favorites,
      views: row.views,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async searchGuideItemListProfile(
    userId: string,
    title: string,
    sortBy: "likes" | "updated" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : "ORDER BY ai.updated_at DESC, ai.likes DESC";

    const guideTypeFilter = guideType ? "AND ai.guide_type = ?" : "";
    const params = guideType ? [userId, `%${title}%`, guideType] : [userId, `%${title}%`];

    const stmt = this.db.prepare(`
      SELECT 
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        c.name as header_card_name,
        c.image_url_cropped as header_card_image_url
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      WHERE ai.user_id = ? AND ai.title LIKE ? ${guideTypeFilter}
      ${orderClause}
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      guide_type: string;
      likes: number;
      favorites: number;
      views: number;
      created_at: string;
      updated_at: string;
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      guideType: row.guide_type as GuideType,
      likes: row.likes,
      favorites: row.favorites,
      views: row.views,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async findArchetypeInstanceByArchetypeAndUserId(
    archetypeId: number,
    userId: string,
  ): Promise<Guide | null> {
    const stmt = this.db.prepare(`
      SELECT *
      FROM archetype_instances
      WHERE archetype_id = ? AND user_id = ?
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      guide_type: string;
      likes: number;
      favorites: number;
      views: number;
      created_at: string;
      updated_at: string;
    }

    const row = stmt.get(archetypeId, userId) as InstanceRow | undefined;
    if (!row) return null;

    return {
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      guideType: row.guide_type as GuideType,
      likes: row.likes,
      favorites: row.favorites,
      views: row.views,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async updateArchetypeInstance(
    id: number,
    data: GuideUpdateDTO,
  ): Promise<Guide> {
    const updates: string[] = [];
    const values: (number | string | null)[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }

    if (data.headerCardId !== undefined) {
      updates.push("header_card_id = ?");
      values.push(data.headerCardId);
    }

    if (data.generalTip !== undefined) {
      updates.push("general_tip = ?");
      values.push(data.generalTip);
    }

    if (updates.length === 0) {
      return this.findArchetypeInstanceById(id) as Promise<Guide>;
    }

    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE archetype_instances
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findArchetypeInstanceById(id) as Promise<Guide>;
  }

  async deleteArchetypeInstanceById(id: number): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM archetype_instances
      WHERE id = ?
    `);

    stmt.run(id);
  }

  async ToggleLikeInstance(
    instanceId: number,
    userId: string,
  ): Promise<LikeToggleResult> {
    // Check if like already exists
    const existingLike = await this.prisma.instanceLike.findUnique({
      where: {
        instanceId_userId: {
          instanceId,
          userId,
        },
      },
    });

    let liked: boolean;

    if (existingLike) {
      // Remove like
      await this.prisma.instanceLike.delete({
        where: { id: existingLike.id },
      });

      // Decrement like count without updating updatedAt
      // Using raw SQL to prevent Prisma's @updatedAt from triggering
      await this.prisma.$executeRaw`
        UPDATE archetype_instances 
        SET likes = likes - 1 
        WHERE id = ${instanceId}
      `;

      liked = false;
    } else {
      // Add like
      await this.prisma.instanceLike.create({
        data: {
          instanceId,
          userId,
        },
      });

      // Increment like count without updating updatedAt
      // Using raw SQL to prevent Prisma's @updatedAt from triggering
      await this.prisma.$executeRaw`
        UPDATE archetype_instances 
        SET likes = likes + 1 
        WHERE id = ${instanceId}
      `;

      liked = true;
    }

    // Get updated count
    const updated = await this.prisma.archetypeInstance.findUnique({
      where: { id: instanceId },
      select: { likes: true },
    });

    return {
      liked,
      likes: updated?.likes ?? 0,
    };
  }

  async hasUserLikedGuide(instanceId: number, userId: string): Promise<boolean> {
    const like = await this.prisma.instanceLike.findUnique({
      where: {
        instanceId_userId: {
          instanceId,
          userId,
        },
      },
    });

    return like !== null;
  }

  async toggleFavoriteGuide(
    instanceId: number,
    userId: string,
  ): Promise<{ favorited: boolean; favorites: number }> {
    // Check if favorite already exists
    const existingFavorite = await this.prisma.instanceFavorite.findUnique({
      where: {
        instanceId_userId: {
          instanceId,
          userId,
        },
      },
    });

    let favorited: boolean;

    if (existingFavorite) {
      // Remove favorite
      await this.prisma.instanceFavorite.delete({
        where: { id: existingFavorite.id },
      });

      // Decrement favorite count without updating updatedAt
      // Using raw SQL to prevent Prisma's @updatedAt from triggering
      // Ensure favorites doesn't go below 0
      await this.prisma.$executeRaw`
        UPDATE archetype_instances 
        SET favorites = MAX(0, favorites - 1) 
        WHERE id = ${instanceId}
      `;

      favorited = false;
    } else {
      // Add favorite
      await this.prisma.instanceFavorite.create({
        data: {
          instanceId,
          userId,
        },
      });

      // Increment favorite count without updating updatedAt
      // Using raw SQL to prevent Prisma's @updatedAt from triggering
      await this.prisma.$executeRaw`
        UPDATE archetype_instances 
        SET favorites = favorites + 1 
        WHERE id = ${instanceId}
      `;

      favorited = true;
    }

    // Get updated count
    const updated = await this.prisma.archetypeInstance.findUnique({
      where: { id: instanceId },
      select: { favorites: true },
    });

    return {
      favorited,
      favorites: updated?.favorites ?? 0,
    };
  }

  async hasUserFavoritedGuide(instanceId: number, userId: string): Promise<boolean> {
    const favorite = await this.prisma.instanceFavorite.findUnique({
      where: {
        instanceId_userId: {
          instanceId,
          userId,
        },
      },
    });

    return favorite !== null;
  }

  async findFavoritedInstancesByUserId(userId: string): Promise<GuideListItem[]> {
    const stmt = this.db.prepare(`
      SELECT 
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        c.name as header_card_name,
        c.image_url_cropped as header_card_image_url,
        f.created_at as favorited_at
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      INNER JOIN instance_favorites f ON ai.id = f.instance_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      guide_type: string;
      likes: number;
      favorites: number;
      views: number;
      created_at: string;
      updated_at: string;
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(userId) as InstanceRow[];

    return rows.map((row) => ({
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      guideType: row.guide_type as GuideType,
      likes: row.likes,
      favorites: row.favorites,
      views: row.views,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async incrementViewCount(instanceId: number, incrementBy: number): Promise<void> {
    // Use raw SQL to increment without triggering @updatedAt
    await this.prisma.$executeRaw`
      UPDATE archetype_instances 
      SET views = views + ${incrementBy}
      WHERE id = ${instanceId}
    `;
  }

  async getTotalViewsByUserId(userId: string): Promise<number> {
    const result = await this.prisma.archetypeInstance.aggregate({
      where: { userId },
      _sum: {
        views: true,
      },
    });

    return result._sum.views ?? 0;
  }

async findLatestCreatedInstances(
  limit: number,
  guideType?: GuideType,
): Promise<GuideListItem[]> {
  const guideTypeFilter = guideType ? "WHERE ai.guide_type = ?" : "";
  const params = guideType ? [guideType, limit] : [limit];

  const stmt = this.db.prepare(`
    SELECT 
      ai.*,
      a.name as archetype_name,
      u.namedb as user_name,
      p.profile_picture_url as user_profile_picture_url,
      c.name as header_card_name,
      c.image_url_cropped as header_card_image_url,
      CAST((strftime('%s', 'now') - strftime('%s', ai.created_at)) / 60 AS INTEGER) as minutes_ago
    FROM archetype_instances ai
    JOIN archetypes a ON ai.archetype_id = a.id
    JOIN users u ON ai.user_id = u.id
    LEFT JOIN profiles p ON u.id = p.user_id
    LEFT JOIN cards c ON ai.header_card_id = c.id
    ${guideTypeFilter}
    ORDER BY ai.updated_at DESC
    LIMIT ?
  `);

  interface InstanceRow {
    id: number;
    archetype_id: number;
    user_id: string;
    title: string;
    header_card_id: number | null;
    general_tip: string | null;
    guide_type: string;
    likes: number;
    favorites: number;
    views: number;
    created_at: string;
    updated_at: string;
    archetype_name: string;
    user_name: string;
    user_profile_picture_url: string | null;
    header_card_name: string | null;
    header_card_image_url: string | null;
    minutes_ago: number;
  }

  const rows = stmt.all(...params) as InstanceRow[];

  return rows.map((row) => ({
    id: row.id,
    archetypeId: row.archetype_id,
    userId: row.user_id,
    title: row.title,
    headerCardId: row.header_card_id,
    generalTip: row.general_tip,
    guideType: row.guide_type as GuideType,
    likes: row.likes,
    favorites: row.favorites,
    views: row.views,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    minutesAgo: row.minutes_ago,
    archetypeName: row.archetype_name,
    userName: row.user_name,
    userProfilePictureUrl: row.user_profile_picture_url,
    headerCardName: row.header_card_name ?? undefined,
    headerCardImageUrl: row.header_card_image_url ?? undefined,
  }));
}
}
