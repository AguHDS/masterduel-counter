import {
  RecommendedDeck,
  RecommendedDeckCreateDTO,
  RecommendedDeckUpdateDTO,
  RecommendedDeckWithCards,
} from "../../domain/RecommendedDeck";

export interface RecommendedDeckServicePort {
  createDeck(data: RecommendedDeckCreateDTO): Promise<RecommendedDeck>;
  getDeckByInstanceId(instanceId: number): Promise<RecommendedDeckWithCards | null>;
  updateDeck(instanceId: number, data: RecommendedDeckUpdateDTO): Promise<RecommendedDeck>;
  deleteDeck(instanceId: number): Promise<void>;
}
