import Database from "better-sqlite3";
import {
  Guide,
  GuideCreateDTO,
  GuideUpdateDTO,
  GuideListItem,
  GuideType,
  SaveDraftDTO,
} from "@/domain/Guide.js";
import {
  GuideRepository,
  LikeToggleResult,
} from "@/domain/ports/GuideRepository.js";
import { PrismaClient } from "@prisma/client";

interface BaseInstanceRow {
  id: number;
  archetype_id: number;
  user_id: string;
  title: string;
  header_card_id: number | null;
  general_tip: string | null;
  guide_type: string;
  is_draft: number;
  draft_expires_at: string | null;
  guide_request_id: number | null;
  likes: number;
  favorites: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export class SqliteArchetypeGuideRepository implements GuideRepository {
  constructor(
    private db: Database.Database,
    private prisma: PrismaClient,
  ) {}

  private mapRowToGuide(row: BaseInstanceRow): Guide {
    return {
      id: row.id,
      archetypeId: row.archetype_id,
      userId: row.user_id,
      title: row.title,
      headerCardId: row.header_card_id,
      generalTip: row.general_tip,
      guideType: row.guide_type as GuideType,
      isDraft: Boolean(row.is_draft),
      draftExpiresAt: row.draft_expires_at ? new Date(row.draft_expires_at) : null,
      guideRequestId: row.guide_request_id ?? null,
      likes: row.likes,
      favorites: row.favorites,
      views: row.views,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async createArchetypeInstance(data: GuideCreateDTO): Promise<Guide> {
    const stmt = this.db.prepare(`
      INSERT INTO archetype_instances (archetype_id, user_id, title, header_card_id, general_tip, guide_type, is_draft, draft_expires_at, likes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      data.archetypeId,
      data.userId,
      data.title,
      data.headerCardId,
      data.generalTip || null,
      data.guideType,
      data.isDraft ? 1 : 0,
      data.draftExpiresAt ? data.draftExpiresAt.toISOString() : null,
    );

    return this.findArchetypeInstanceById(result.lastInsertRowid as number) as Promise<Guide>;
  }

  async findArchetypeInstanceById(id: number): Promise<Guide | null> {
    const stmt = this.db.prepare(`SELECT * FROM archetype_instances WHERE id = ?`);
    const row = stmt.get(id) as BaseInstanceRow | undefined;
    if (!row) return null;
    return this.mapRowToGuide(row);
  }

  async findArchetypeInstanceByArchetypeId(
    archetypeId: number,
    sortBy: "likes" | "updated" | "views" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : sortBy === "views"
          ? "ORDER BY ai.views DESC, ai.updated_at DESC"
          : "ORDER BY ai.updated_at DESC, ai.likes DESC";

    const guideTypeFilter = guideType ? "AND ai.guide_type = ?" : "";
    const params = guideType ? [archetypeId, guideType] : [archetypeId];

    const stmt = this.db.prepare(`
      SELECT 
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        c.name as header_card_name,
        c.image_url_cropped as header_card_image_url,
        EXISTS(SELECT 1 FROM archetype_card_pairs acp WHERE acp.instance_id = ai.id AND acp.pair_section = 'HANDTRAP') as has_handtraps,
        EXISTS(SELECT 1 FROM archetype_card_pairs acp WHERE acp.instance_id = ai.id AND acp.pair_section = 'BOARD_BREAKER') as has_boardbreakers,
        EXISTS(SELECT 1 FROM initial_hands ih WHERE ih.instance_id = ai.id) as has_initial_hands,
        EXISTS(SELECT 1 FROM recommended_decks rd WHERE rd.instance_id = ai.id) as has_recommended_deck
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      WHERE ai.archetype_id = ? AND ai.is_draft = 0 ${guideTypeFilter}
      ${orderClause}
    `);

    interface InstanceRow extends BaseInstanceRow {
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
      has_handtraps: number;
      has_boardbreakers: number;
      has_initial_hands: number;
      has_recommended_deck: number;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      ...this.mapRowToGuide(row),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
      hasHandtraps: Boolean(row.has_handtraps),
      hasBoardbreakers: Boolean(row.has_boardbreakers),
      hasInitialHands: Boolean(row.has_initial_hands),
      hasRecommendedDeck: Boolean(row.has_recommended_deck),
    }));
  }

  async findArchetypeGuidesByUserId(
    userId: string,
    sortBy: "likes" | "updated" | "views" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : sortBy === "views"
          ? "ORDER BY ai.views DESC, ai.updated_at DESC"
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
      WHERE ai.user_id = ? AND ai.is_draft = 0 ${guideTypeFilter}
      ${orderClause}
    `);

    interface InstanceRow extends BaseInstanceRow {
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      ...this.mapRowToGuide(row),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  /** Find guides by user ID including drafts (for the owner's profile view) */
  async findArchetypeGuidesByUserIdWithDrafts(
    userId: string,
    sortBy: "likes" | "updated" | "views" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.is_draft DESC, ai.likes DESC, ai.updated_at DESC"
        : sortBy === "views"
          ? "ORDER BY ai.is_draft DESC, ai.views DESC, ai.updated_at DESC"
          : "ORDER BY ai.is_draft DESC, ai.updated_at DESC, ai.likes DESC";

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

    interface InstanceRow extends BaseInstanceRow {
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      ...this.mapRowToGuide(row),
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
    sortBy: "likes" | "updated" | "views" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : sortBy === "views"
          ? "ORDER BY ai.views DESC, ai.updated_at DESC"
          : "ORDER BY ai.updated_at DESC, ai.likes DESC";

    const guideTypeFilter = guideType ? "AND ai.guide_type = ?" : "";
    const params = guideType ? [archetypeId, `%${title}%`, guideType] : [archetypeId, `%${title}%`];

    const stmt = this.db.prepare(`
      SELECT 
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        c.name as header_card_name,
        c.image_url_cropped as header_card_image_url,
        EXISTS(SELECT 1 FROM archetype_card_pairs acp WHERE acp.instance_id = ai.id AND acp.pair_section = 'HANDTRAP') as has_handtraps,
        EXISTS(SELECT 1 FROM archetype_card_pairs acp WHERE acp.instance_id = ai.id AND acp.pair_section = 'BOARD_BREAKER') as has_boardbreakers,
        EXISTS(SELECT 1 FROM initial_hands ih WHERE ih.instance_id = ai.id) as has_initial_hands,
        EXISTS(SELECT 1 FROM recommended_decks rd WHERE rd.instance_id = ai.id) as has_recommended_deck
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      WHERE ai.archetype_id = ? AND ai.title LIKE ? AND ai.is_draft = 0 ${guideTypeFilter}
      ${orderClause}
    `);

    interface InstanceRow extends BaseInstanceRow {
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
      has_handtraps: number;
      has_boardbreakers: number;
      has_initial_hands: number;
      has_recommended_deck: number;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      ...this.mapRowToGuide(row),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
      hasHandtraps: Boolean(row.has_handtraps),
      hasBoardbreakers: Boolean(row.has_boardbreakers),
      hasInitialHands: Boolean(row.has_initial_hands),
      hasRecommendedDeck: Boolean(row.has_recommended_deck),
    }));
  }

  async searchGuideItemListProfile(
    userId: string,
    title: string,
    sortBy: "likes" | "updated" | "views" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : sortBy === "views"
          ? "ORDER BY ai.views DESC, ai.updated_at DESC"
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
      WHERE ai.user_id = ? AND ai.title LIKE ? AND ai.is_draft = 0 ${guideTypeFilter}
      ${orderClause}
    `);

    interface InstanceRow extends BaseInstanceRow {
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      ...this.mapRowToGuide(row),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async updateArchetypeGuide(id: number, data: GuideUpdateDTO): Promise<Guide> {
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
    const stmt = this.db.prepare(`DELETE FROM archetype_instances WHERE id = ?`);
    stmt.run(id);
  }

  async getUserDraftCount(userId: string): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM archetype_instances WHERE user_id = ? AND is_draft = 1
    `);
    const row = stmt.get(userId) as { count: number };
    return row.count;
  }

  async saveDraft(data: SaveDraftDTO): Promise<Guide> {
    const {
      archetypeId,
      userId,
      guideType,
      title,
      headerCardId,
      generalTip,
      cardPairs,
      initialHands,
      comboSteps,
      draftInstanceId,
      guideRequestId,
    } = data;

    // If this draft is for a guide request, set expiry to 7 days from now
    const draftExpiresAt = guideRequestId
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : data.draftExpiresAt ?? null;

    let instanceId: number;

    if (draftInstanceId) {
      // Update existing draft metadata
      const updateStmt = this.db.prepare(`
        UPDATE archetype_instances
        SET title = ?, header_card_id = ?, general_tip = ?, draft_expires_at = ?, guide_request_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND is_draft = 1
      `);
      updateStmt.run(
        title ?? "Title",
        headerCardId ?? null,
        generalTip ?? null,
        draftExpiresAt ? draftExpiresAt.toISOString() : null,
        guideRequestId ?? null,
        draftInstanceId,
      );
      instanceId = draftInstanceId;

      // Delete existing card pairs / initial hands before re-inserting
      if (guideType === "COUNTER") {
        this.db.prepare(`DELETE FROM archetype_card_pairs WHERE instance_id = ?`).run(instanceId);
      } else if (guideType === "DECK") {
        // Cascade deletes combo_steps via FK
        this.db.prepare(`DELETE FROM initial_hands WHERE instance_id = ?`).run(instanceId);
      }
    } else {
      // Create new draft
      const insertStmt = this.db.prepare(`
        INSERT INTO archetype_instances (archetype_id, user_id, title, header_card_id, general_tip, guide_type, is_draft, draft_expires_at, guide_request_id, likes, favorites, views, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, 0, 0, 0, CURRENT_TIMESTAMP)
      `);
      const result = insertStmt.run(
        archetypeId,
        userId,
        title ?? "Title",
        headerCardId ?? null,
        generalTip ?? null,
        guideType,
        draftExpiresAt ? draftExpiresAt.toISOString() : null,
        guideRequestId ?? null,
      );
      instanceId = result.lastInsertRowid as number;
    }

    // Persist card pairs for COUNTER drafts
    if (guideType === "COUNTER" && cardPairs && cardPairs.length > 0) {
      const insertPair = this.db.prepare(`
        INSERT INTO archetype_card_pairs (instance_id, pair_order, pair_section, comment)
        VALUES (?, ?, ?, ?)
      `);
      const insertTop = this.db.prepare(`
        INSERT INTO card_pair_top (pair_id, card_id, position) VALUES (?, ?, ?)
      `);
      const insertBottom = this.db.prepare(`
        INSERT INTO card_pair_bottom (pair_id, card_id, position, effectiveness) VALUES (?, ?, ?, ?)
      `);

      cardPairs.forEach((pair, index) => {
        const pairResult = insertPair.run(instanceId, index + 1, pair.pairSection ?? null, pair.comment ?? null);
        const pairId = pairResult.lastInsertRowid as number;
        pair.topCardIds.forEach((cardId, pos) => insertTop.run(pairId, cardId, pos));
        pair.bottomCardIds.forEach((bc, pos) => insertBottom.run(pairId, bc.cardId, pos, bc.effectiveness ?? null));
      });
    }

    // Persist initial hands for DECK drafts
    if (guideType === "DECK" && initialHands && initialHands.length > 0) {
      const insertHand = this.db.prepare(`
        INSERT INTO initial_hands (instance_id, card_ids, description, final_board_state, position)
        VALUES (?, ?, ?, ?, ?)
      `);
      initialHands.forEach((hand, index) => {
        insertHand.run(
          instanceId,
          JSON.stringify(hand.cardIds),
          hand.description ?? null,
          hand.finalBoard ? JSON.stringify(hand.finalBoard) : null,
          index,
        );
      });

      // Persist combo steps if provided
      if (comboSteps && comboSteps.length > 0) {
        const createdHands = this.db.prepare(`
          SELECT id FROM initial_hands WHERE instance_id = ? ORDER BY position ASC
        `).all(instanceId) as { id: number }[];

        for (const handCombo of comboSteps) {
          const realHandId = createdHands[handCombo.initialHandId]?.id;
          if (!realHandId) continue;

          const createdStepsMap = new Map<number, number>();

          for (let i = 0; i < handCombo.steps.length; i++) {
            const step = handCombo.steps[i];
            let parentCanceledStepId: number | null = null;
            if (step.parentCanceledStepIndex !== undefined) {
              parentCanceledStepId = createdStepsMap.get(step.parentCanceledStepIndex) ?? null;
            }

            const stepResult = this.db.prepare(`
              INSERT INTO combo_steps (initial_hand_id, step_order, description, parent_canceled_step_id)
              VALUES (?, ?, ?, ?)
            `).run(realHandId, step.stepOrder, step.description ?? null, parentCanceledStepId);
            const stepId = stepResult.lastInsertRowid as number;
            createdStepsMap.set(i, stepId);

            step.mainCardIds.forEach((cardId, pos) => {
              this.db.prepare(`INSERT INTO combo_step_main_cards (step_id, card_id, position, chain_number) VALUES (?, ?, ?, ?)`).run(
                stepId, cardId, pos, step.mainCardChains?.[pos] ?? null
              );
            });
            step.subCardIds.forEach((cardId, pos) => {
              this.db.prepare(`INSERT INTO combo_step_sub_cards (step_id, card_id, position, chain_number) VALUES (?, ?, ?, ?)`).run(
                stepId, cardId, pos, step.subCardChains?.[pos] ?? null
              );
            });
            (step.leftSubCardIds ?? []).forEach((cardId, pos) => {
              this.db.prepare(`INSERT INTO combo_step_left_sub_cards (step_id, card_id, position, chain_number) VALUES (?, ?, ?, ?)`).run(
                stepId, cardId, pos, step.leftSubCardChains?.[pos] ?? null
              );
            });
          }
        }
      }
    }

    return this.findArchetypeInstanceById(instanceId) as Promise<Guide>;
  }

  async deleteExpiredDrafts(): Promise<number> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      DELETE FROM archetype_instances
      WHERE is_draft = 1 AND draft_expires_at IS NOT NULL AND draft_expires_at < ?
    `);
    const result = stmt.run(now);
    return result.changes;
  }

  async getExpiredDraftGuideRequestIds(): Promise<number[]> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      SELECT guide_request_id FROM archetype_instances
      WHERE is_draft = 1 AND draft_expires_at IS NOT NULL AND draft_expires_at < ? AND guide_request_id IS NOT NULL
    `);
    const rows = stmt.all(now) as { guide_request_id: number }[];
    return rows.map((r) => r.guide_request_id);
  }

  async toggleLikeGuide(instanceId: number, userId: string): Promise<LikeToggleResult> {
    const existingLike = await this.prisma.instanceLike.findUnique({
      where: { instanceId_userId: { instanceId, userId } },
    });

    let liked: boolean;

    if (existingLike) {
      await this.prisma.instanceLike.delete({ where: { id: existingLike.id } });
      await this.prisma.$executeRaw`UPDATE archetype_instances SET likes = likes - 1 WHERE id = ${instanceId}`;
      liked = false;
    } else {
      await this.prisma.instanceLike.create({ data: { instanceId, userId } });
      await this.prisma.$executeRaw`UPDATE archetype_instances SET likes = likes + 1 WHERE id = ${instanceId}`;
      liked = true;
    }

    const updated = await this.prisma.archetypeInstance.findUnique({
      where: { id: instanceId },
      select: { likes: true },
    });

    return { liked, likes: updated?.likes ?? 0 };
  }

  async hasUserLikedGuide(instanceId: number, userId: string): Promise<boolean> {
    const like = await this.prisma.instanceLike.findUnique({
      where: { instanceId_userId: { instanceId, userId } },
    });
    return like !== null;
  }

  async toggleFavoriteGuide(instanceId: number, userId: string): Promise<{ favorited: boolean; favorites: number }> {
    const existingFavorite = await this.prisma.instanceFavorite.findUnique({
      where: { instanceId_userId: { instanceId, userId } },
    });

    let favorited: boolean;

    if (existingFavorite) {
      await this.prisma.instanceFavorite.delete({ where: { id: existingFavorite.id } });
      await this.prisma.$executeRaw`UPDATE archetype_instances SET favorites = MAX(0, favorites - 1) WHERE id = ${instanceId}`;
      favorited = false;
    } else {
      await this.prisma.instanceFavorite.create({ data: { instanceId, userId } });
      await this.prisma.$executeRaw`UPDATE archetype_instances SET favorites = favorites + 1 WHERE id = ${instanceId}`;
      favorited = true;
    }

    const updated = await this.prisma.archetypeInstance.findUnique({
      where: { id: instanceId },
      select: { favorites: true },
    });

    return { favorited, favorites: updated?.favorites ?? 0 };
  }

  async hasUserFavoritedGuide(instanceId: number, userId: string): Promise<boolean> {
    const favorite = await this.prisma.instanceFavorite.findUnique({
      where: { instanceId_userId: { instanceId, userId } },
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
      WHERE f.user_id = ? AND ai.is_draft = 0
      ORDER BY f.created_at DESC
    `);

    interface InstanceRow extends BaseInstanceRow {
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
    }

    const rows = stmt.all(userId) as InstanceRow[];

    return rows.map((row) => ({
      ...this.mapRowToGuide(row),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
    }));
  }

  async incrementViewCount(instanceId: number, incrementBy: number): Promise<void> {
    await this.prisma.$executeRaw`UPDATE archetype_instances SET views = views + ${incrementBy} WHERE id = ${instanceId}`;
  }

  async tryRegisterView(
    instanceId: number,
    viewerFingerprints: string[],
    viewedAt: Date,
    cooldownMs: number,
  ): Promise<boolean> {
    const uniqueFingerprints = [...new Set(viewerFingerprints.filter(Boolean))];

    if (uniqueFingerprints.length === 0) {
      return false;
    }

    const transaction = this.db.transaction(
      (trackedInstanceId: number, fingerprints: string[], viewedAtIso: string, cooldownWindowMs: number) => {
        const existingViewStmt = this.db.prepare(`
          SELECT last_viewed_at FROM guide_view_tracking WHERE instance_id = ? AND viewer_fingerprint = ?
        `);

        for (const fingerprint of fingerprints) {
          const existingView = existingViewStmt.get(trackedInstanceId, fingerprint) as { last_viewed_at: string } | undefined;
          if (!existingView) continue;
          const elapsedMs = viewedAt.getTime() - new Date(existingView.last_viewed_at).getTime();
          if (elapsedMs < cooldownWindowMs) return false;
        }

        const upsertStmt = this.db.prepare(`
          INSERT INTO guide_view_tracking (instance_id, viewer_fingerprint, last_viewed_at)
          VALUES (?, ?, ?)
          ON CONFLICT(instance_id, viewer_fingerprint)
          DO UPDATE SET last_viewed_at = excluded.last_viewed_at
        `);

        for (const fingerprint of fingerprints) {
          upsertStmt.run(trackedInstanceId, fingerprint, viewedAtIso);
        }

        return true;
      },
    );

    return transaction(instanceId, uniqueFingerprints, viewedAt.toISOString(), cooldownMs);
  }

  async cleanupOldViewTracking(cutoffDate: Date): Promise<number> {
    const result = await this.prisma.guideViewTracking.deleteMany({
      where: { lastViewedAt: { lt: cutoffDate } },
    });
    return result.count;
  }

  async getTotalViewsByUserId(userId: string): Promise<number> {
    const result = await this.prisma.archetypeInstance.aggregate({
      where: { userId, isDraft: false },
      _sum: { views: true },
    });
    return result._sum.views ?? 0;
  }

  async findLastestCreatedGuides(limit: number, guideType?: GuideType): Promise<GuideListItem[]> {
    const guideTypeFilter = guideType ? "AND ai.guide_type = ?" : "";
    const params = guideType ? [guideType, limit] : [limit];

    const stmt = this.db.prepare(`
      SELECT 
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        p.profile_picture_url as user_profile_picture_url,
        c.name as header_card_name,
        c.image_url_cropped as header_card_image_url,
        CAST((strftime('%s', 'now') - strftime('%s', ai.created_at)) / 60 AS INTEGER) as minutes_ago,
        EXISTS(SELECT 1 FROM archetype_card_pairs acp WHERE acp.instance_id = ai.id AND acp.pair_section = 'HANDTRAP') as has_handtraps,
        EXISTS(SELECT 1 FROM archetype_card_pairs acp WHERE acp.instance_id = ai.id AND acp.pair_section = 'BOARD_BREAKER') as has_boardbreakers,
        EXISTS(SELECT 1 FROM initial_hands ih WHERE ih.instance_id = ai.id) as has_initial_hands,
        EXISTS(SELECT 1 FROM recommended_decks rd WHERE rd.instance_id = ai.id) as has_recommended_deck
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      WHERE ai.is_draft = 0 ${guideTypeFilter}
      ORDER BY ai.updated_at DESC
      LIMIT ?
    `);

    interface InstanceRow extends BaseInstanceRow {
      archetype_name: string;
      user_name: string;
      user_profile_picture_url: string | null;
      header_card_name: string | null;
      header_card_image_url: string | null;
      minutes_ago: number;
      has_handtraps: number;
      has_boardbreakers: number;
      has_initial_hands: number;
      has_recommended_deck: number;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      ...this.mapRowToGuide(row),
      minutesAgo: row.minutes_ago,
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: row.user_profile_picture_url,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
      hasHandtraps: Boolean(row.has_handtraps),
      hasBoardbreakers: Boolean(row.has_boardbreakers),
      hasInitialHands: Boolean(row.has_initial_hands),
      hasRecommendedDeck: Boolean(row.has_recommended_deck),
    }));
  }

  async findAllGuides(
    sortBy: "likes" | "updated" | "views" = "updated",
    guideType?: GuideType,
    search?: string,
  ): Promise<GuideListItem[]> {
    const orderClause =
      sortBy === "likes"
        ? "ORDER BY ai.likes DESC, ai.updated_at DESC"
        : sortBy === "views"
          ? "ORDER BY ai.views DESC, ai.updated_at DESC"
          : "ORDER BY ai.updated_at DESC, ai.likes DESC";

    const conditions: string[] = ["ai.is_draft = 0"];
    const params: (string | number)[] = [];

    if (guideType) {
      conditions.push("ai.guide_type = ?");
      params.push(guideType);
    }

    if (search && search.trim()) {
      conditions.push("(ai.title LIKE ? OR a.name LIKE ?)");
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const stmt = this.db.prepare(`
      SELECT
        ai.*,
        a.name as archetype_name,
        u.namedb as user_name,
        c.name as header_card_name,
        c.image_url_cropped as header_card_image_url,
        EXISTS(SELECT 1 FROM archetype_card_pairs acp WHERE acp.instance_id = ai.id AND acp.pair_section = 'HANDTRAP') as has_handtraps,
        EXISTS(SELECT 1 FROM archetype_card_pairs acp WHERE acp.instance_id = ai.id AND acp.pair_section = 'BOARD_BREAKER') as has_boardbreakers,
        EXISTS(SELECT 1 FROM initial_hands ih WHERE ih.instance_id = ai.id) as has_initial_hands,
        EXISTS(SELECT 1 FROM recommended_decks rd WHERE rd.instance_id = ai.id) as has_recommended_deck
      FROM archetype_instances ai
      JOIN archetypes a ON ai.archetype_id = a.id
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN cards c ON ai.header_card_id = c.id
      ${whereClause}
      ${orderClause}
    `);

    interface InstanceRow extends BaseInstanceRow {
      archetype_name: string;
      user_name: string;
      header_card_name: string | null;
      header_card_image_url: string | null;
      has_handtraps: number;
      has_boardbreakers: number;
      has_initial_hands: number;
      has_recommended_deck: number;
    }

    const rows = stmt.all(...params) as InstanceRow[];

    return rows.map((row) => ({
      ...this.mapRowToGuide(row),
      archetypeName: row.archetype_name,
      userName: row.user_name,
      userProfilePictureUrl: null,
      headerCardName: row.header_card_name ?? undefined,
      headerCardImageUrl: row.header_card_image_url ?? undefined,
      hasHandtraps: Boolean(row.has_handtraps),
      hasBoardbreakers: Boolean(row.has_boardbreakers),
      hasInitialHands: Boolean(row.has_initial_hands),
      hasRecommendedDeck: Boolean(row.has_recommended_deck),
    }));
  }
}
