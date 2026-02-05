import { Card } from "../Card";

export interface CardRepository {
  findByName(name: string): Promise<Card[]>;
  /** Find Card by its ID */
  findById(id: number): Promise<Card | null>;
  save(card: Card): Promise<void>;
  existsById(id: number): Promise<boolean>;
  updateToPermanent(id: number): Promise<void>;
  findTemporaryOlderThan(hours: number): Promise<Card[]>;
  deleteById(id: number): Promise<void>;
}
