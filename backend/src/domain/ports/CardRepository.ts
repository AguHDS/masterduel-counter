import { Card } from "../Card.js";

export interface CardRepository {
  /** Find Card by its ID */
  finCardById(id: number): Promise<Card | null>;
  /** Save or update a Card */
  saveOrUpdateCard(card: Card): Promise<void>;
  /** Delete card by its ID */
  deleteCardById(id: number): Promise<void>;
  /** Get all cards from database */
  getAllCards(): Promise<Card[]>;
}
