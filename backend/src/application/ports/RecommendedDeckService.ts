import {
  RecommendedDeck,
  RecommendedDeckCreateDTO,
  RecommendedDeckUpdateDTO,
  RecommendedDeckWithCards,
} from "@/domain/RecommendedDeck.js";

export interface RecommendedDeckServicePort {
  /** Create a new recommended deck */
  createDeck(data: RecommendedDeckCreateDTO): Promise<RecommendedDeck>;
  /** Get a recommended deck by its instance ID */
  getDeckByInstanceId(instanceId: number): Promise<RecommendedDeckWithCards | null>;
  /** Update a recommended deck by its instance ID */
  updateDeck(instanceId: number, data: RecommendedDeckUpdateDTO): Promise<RecommendedDeck>;
  /** Delete a recommended deck by its instance ID */
  deleteDeck(instanceId: number): Promise<void>;
}
