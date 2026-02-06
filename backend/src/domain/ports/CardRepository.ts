import { Card } from "../Card";

export interface CardRepository {
  /** Find Card by its ID */
  finCardById(id: number): Promise<Card | null>;
  /** Save or update a Card */
  saveOrUpdateCard(card: Card): Promise<void>;
  /** Mark Card as permanent (not temporary) */
  updateCardToPermanent(id: number): Promise<void>;
  /** Find temporary Cards older than specified hours */
  findTemporaryCardOlderThan(hours: number): Promise<Card[]>;
  /** Delete card by its ID */
  deleteCardById(id: number): Promise<void>;
}
