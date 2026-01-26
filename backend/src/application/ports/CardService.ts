import { CardSearchResult, CardPreviewDTO } from "@/domain/Card";

export interface CardService {
  searchCards(query: string): Promise<CardSearchResult[]>;
  selectCard(cardId: number): Promise<CardPreviewDTO>;
  confirmSelectedCards(cardIds: number[]): Promise<void>;
  cleanupTemporaryCards(): Promise<number>;
}
