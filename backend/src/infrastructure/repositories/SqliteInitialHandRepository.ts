import Database from "better-sqlite3";
import {
  FinalBoardCard,
  FinalBoardPreview,
  FinalBoardPreviewWithCards,
  InitialHand,
  InitialHandWithCards,
  InitialHandCreateDTO,
} from "@/domain/InitialHand.js";
import { InitialHandRepository } from "@/domain/ports/InitialHandRepository.js";

export class SqliteInitialHandRepository implements InitialHandRepository {
  constructor(private db: Database.Database) {}

  private mapCardRow(card: {
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }): FinalBoardCard {
    return {
      id: card.id,
      name: card.name,
      imageUrl: card.image_url,
      imageUrlSmall: card.image_url_small,
      imageUrlCropped: card.image_url_cropped,
    };
  }

  private fetchCardsByIds(cardIds: number[]): FinalBoardCard[] {
    if (cardIds.length === 0) {
      return [];
    }

    const placeholders = cardIds.map(() => "?").join(",");
    const cardStmt = this.db.prepare(`
      SELECT id, name, image_url, image_url_small, image_url_cropped
      FROM cards
      WHERE id IN (${placeholders})
    `);

    interface CardRow {
      id: number;
      name: string;
      image_url: string;
      image_url_small: string;
      image_url_cropped: string;
    }

    const cardRows = cardStmt.all(...cardIds) as CardRow[];
    return cardRows.map((card) => this.mapCardRow(card));
  }

  private normalizeNullableCardIdArray(
    value: unknown,
    expectedLength: number,
  ): Array<number | null> {
    const normalized = Array.isArray(value) ? value.slice(0, expectedLength) : [];

    while (normalized.length < expectedLength) {
      normalized.push(null);
    }

    return normalized.map((entry) =>
      typeof entry === "number" && Number.isInteger(entry) && entry > 0
        ? entry
        : null,
    );
  }

  private normalizeCardIdArray(value: unknown): number[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (entry): entry is number =>
        typeof entry === "number" && Number.isInteger(entry) && entry > 0,
    );
  }

  private parseFinalBoard(raw: string | null): FinalBoardPreview | undefined {
    // Normalize stored JSON so malformed or partial data does not break guide reads.
    if (!raw) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;

      return {
        fieldSpellCardId:
          typeof parsed.fieldSpellCardId === "number" &&
          Number.isInteger(parsed.fieldSpellCardId) &&
          parsed.fieldSpellCardId > 0
            ? parsed.fieldSpellCardId
            : null,
        extraMonsterCardIds: this.normalizeNullableCardIdArray(
          parsed.extraMonsterCardIds,
          2,
        ),
        monsterCardIds: this.normalizeNullableCardIdArray(
          parsed.monsterCardIds,
          5,
        ),
        spellTrapCardIds: this.normalizeNullableCardIdArray(
          parsed.spellTrapCardIds,
          5,
        ),
        handCardIds: this.normalizeNullableCardIdArray(parsed.handCardIds, 5),
        graveyardCardIds: this.normalizeCardIdArray(parsed.graveyardCardIds),
        banishedCardIds: this.normalizeCardIdArray(parsed.banishedCardIds),
        description:
          typeof parsed.description === "string" ? parsed.description : undefined,
      };
    } catch {
      return undefined;
    }
  }

  private hydrateNullableSlots(
    slotIds: Array<number | null>,
    cardsById: Map<number, FinalBoardCard>,
  ): Array<FinalBoardCard | null> {
    return slotIds.map((cardId) => (cardId ? cardsById.get(cardId) || null : null));
  }

  private hydrateFinalBoard(
    finalBoard: FinalBoardPreview | undefined,
    cardsById: Map<number, FinalBoardCard>,
  ): FinalBoardPreviewWithCards | undefined {
    // Replace persisted card IDs with full card objects used by the frontend.
    if (!finalBoard) {
      return undefined;
    }

    return {
      fieldSpell: finalBoard.fieldSpellCardId
        ? cardsById.get(finalBoard.fieldSpellCardId) || null
        : null,
      extraMonsters: this.hydrateNullableSlots(
        finalBoard.extraMonsterCardIds,
        cardsById,
      ),
      monsters: this.hydrateNullableSlots(finalBoard.monsterCardIds, cardsById),
      spellTraps: this.hydrateNullableSlots(
        finalBoard.spellTrapCardIds,
        cardsById,
      ),
      hand: this.hydrateNullableSlots(finalBoard.handCardIds, cardsById),
      graveyard: finalBoard.graveyardCardIds
        .map((cardId) => cardsById.get(cardId))
        .filter((card): card is FinalBoardCard => card !== undefined),
      banished: finalBoard.banishedCardIds
        .map((cardId) => cardsById.get(cardId))
        .filter((card): card is FinalBoardCard => card !== undefined),
      description: finalBoard.description,
    };
  }

  async createInitialHand(data: InitialHandCreateDTO): Promise<InitialHand> {
    const stmt = this.db.prepare(`
      INSERT INTO initial_hands (instance_id, card_ids, description, final_board_state, position)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.instanceId,
      JSON.stringify(data.cardIds),
      data.description || null,
      data.finalBoard ? JSON.stringify(data.finalBoard) : null,
      data.position,
    );

    const selectStmt = this.db.prepare(`
      SELECT * FROM initial_hands WHERE id = ?
    `);

    interface InitialHandRow {
      id: number;
      instance_id: number;
      card_ids: string;
      description: string | null;
      final_board_state: string | null;
      position: number;
      created_at: string;
    }

    const row = selectStmt.get(result.lastInsertRowid) as InitialHandRow;

    return {
      id: row.id,
      instanceId: row.instance_id,
      cardIds: JSON.parse(row.card_ids),
      description: row.description || undefined,
      finalBoard: this.parseFinalBoard(row.final_board_state),
      position: row.position,
      createdAt: new Date(row.created_at),
    };
  }

  async createManyInitialHands(
    instanceId: number,
    initialHands: Array<{
      cardIds: number[];
      description?: string;
      finalBoard?: FinalBoardPreview;
    }>,
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO initial_hands (instance_id, card_ids, description, final_board_state, position)
      VALUES (?, ?, ?, ?, ?)
    `);

    initialHands.forEach((hand, index) => {
      stmt.run(
        instanceId,
        JSON.stringify(hand.cardIds),
        hand.description || null,
        hand.finalBoard ? JSON.stringify(hand.finalBoard) : null,
        index,
      );
    });
  }

  async findInitialHandsByInstanceId(
    instanceId: number,
  ): Promise<InitialHandWithCards[]> {
    const stmt = this.db.prepare(`
      SELECT 
        ih.id,
        ih.instance_id,
        ih.card_ids,
        ih.description,
        ih.final_board_state,
        ih.position,
        ih.created_at
      FROM initial_hands ih
      WHERE ih.instance_id = ?
      ORDER BY ih.position ASC
    `);

    interface InitialHandRow {
      id: number;
      instance_id: number;
      card_ids: string;
      description: string | null;
      final_board_state: string | null;
      position: number;
      created_at: string;
    }

    const rows = stmt.all(instanceId) as InitialHandRow[];

    // Hydrate both the opening hand cards and the optional final board from the same card pool.
    const results: InitialHandWithCards[] = [];

    for (const row of rows) {
      const cardIds = JSON.parse(row.card_ids) as number[];
      const finalBoard = this.parseFinalBoard(row.final_board_state);
      const finalBoardCardIds = finalBoard
        ? [
            ...(finalBoard.fieldSpellCardId ? [finalBoard.fieldSpellCardId] : []),
            ...finalBoard.extraMonsterCardIds.filter(
              (cardId): cardId is number => cardId !== null,
            ),
            ...finalBoard.monsterCardIds.filter(
              (cardId): cardId is number => cardId !== null,
            ),
            ...finalBoard.spellTrapCardIds.filter(
              (cardId): cardId is number => cardId !== null,
            ),
            ...finalBoard.handCardIds.filter(
              (cardId): cardId is number => cardId !== null,
            ),
            ...finalBoard.graveyardCardIds,
            ...finalBoard.banishedCardIds,
          ]
        : [];
      const uniqueCardIds = [...new Set([...cardIds, ...finalBoardCardIds])];
      const cards = this.fetchCardsByIds(uniqueCardIds);
      const cardsById = new Map(cards.map((card) => [card.id, card]));
      
      if (cardIds.length === 0) {
        results.push({
          id: row.id,
          instanceId: row.instance_id,
          cards: [],
          description: row.description || undefined,
          finalBoard: this.hydrateFinalBoard(finalBoard, cardsById),
          position: row.position,
          createdAt: new Date(row.created_at),
        });
        continue;
      }

      // Preserve order of cardIds
      const orderedCards = cardIds
        .map((id) => cardsById.get(id))
        .filter((card): card is FinalBoardCard => card !== undefined);

      results.push({
        id: row.id,
        instanceId: row.instance_id,
        cards: orderedCards,
        description: row.description || undefined,
        finalBoard: this.hydrateFinalBoard(finalBoard, cardsById),
        position: row.position,
        createdAt: new Date(row.created_at),
      });
    }

    return results;
  }

  async deleteInitialHandsByInstanceId(instanceId: number): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM initial_hands
      WHERE instance_id = ?
    `);

    stmt.run(instanceId);
  }
}
