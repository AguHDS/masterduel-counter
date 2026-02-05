import Database from "better-sqlite3";
import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
} from "@/domain/ArchetypeInstance";
import {
  ArchetypeInstanceRepository,
  LikeToggleResult,
} from "@/domain/ports/ArchetypeInstanceRepository";
import { PrismaClient } from "@prisma/client";

export class SqliteArchetypeInstanceRepository implements ArchetypeInstanceRepository {
  constructor(
    private db: Database.Database,
    private prisma: PrismaClient,
  ) {}

  async createArchetypeInstance(
    data: ArchetypeInstanceCreateDTO,
  ): Promise<ArchetypeInstance> {
    const stmt = this.db.prepare(`
      INSERT INTO archetype_instances (archetype_id, user_id, title, header_card_id, general_tip, likes, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      data.archetypeId,
      data.userId,
      data.title,
      data.headerCardId,
      data.generalTip || null,
    );

    return this.findArchetypeInstanceById(
      result.lastInsertRowid as number,
    ) as Promise<ArchetypeInstance>;
  }

  async findArchetypeInstanceById(
    id: number,
  ): Promise<ArchetypeInstance | null> {
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
      likes: number;
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
      likes: row.likes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findArchetypeInstanceByArchetypeId(
    archetypeId: number,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<ArchetypeInstanceWithDetails[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : "ORDER BY ai.updated_at DESC, ai.likes DESC";

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
      WHERE ai.archetype_id = ?
      ${orderClause}
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      likes: number;
      created_at: string;
      updated_at: string;
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(archetypeId) as InstanceRow[];

    return rows.map((row) => ({
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      likes: row.likes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async findArchetypeInstanceByUserId(
    userId: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<ArchetypeInstanceWithDetails[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : "ORDER BY ai.updated_at DESC, ai.likes DESC";

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
      WHERE ai.user_id = ?
      ${orderClause}
    `);

    interface InstanceRow {
      id: number;
      archetype_id: number;
      user_id: string;
      title: string;
      header_card_id: number | null;
      general_tip: string | null;
      likes: number;
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
      likes: row.likes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async findArchetypeInstanceByArchetypeAndUserId(
    archetypeId: number,
    userId: string,
  ): Promise<ArchetypeInstance | null> {
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
      likes: number;
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
      likes: row.likes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async updateArchetypeInstance(
    id: number,
    data: ArchetypeInstanceUpdateDTO,
  ): Promise<ArchetypeInstance> {
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
      return this.findArchetypeInstanceById(id) as Promise<ArchetypeInstance>;
    }

    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE archetype_instances
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findArchetypeInstanceById(id) as Promise<ArchetypeInstance>;
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

  async hasUserLikedInstance(instanceId: number, userId: string): Promise<boolean> {
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
}
