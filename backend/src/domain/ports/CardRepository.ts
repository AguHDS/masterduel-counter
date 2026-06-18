import { Card } from "../Card.js";

export interface CardRepository {
  /** Find Card by its ID */
  finCardById(id: number): Promise<Card | null>;
  /** Find multiple Cards by their IDs (batch lookup) */
  findCardsByIds(ids: number[]): Promise<Card[]>;
  /** Save or update a Card */
  saveOrUpdateCard(card: Card): Promise<void>;
  /** Delete card by its ID */
  deleteCardById(id: number): Promise<void>;
  /** Get all cards from database */
  getAllCards(): Promise<Card[]>;
  /** Find cards by archetype name (case-insensitive LIKE match) */
  findCardsByArchetype(archetype: string): Promise<Card[]>;
}
