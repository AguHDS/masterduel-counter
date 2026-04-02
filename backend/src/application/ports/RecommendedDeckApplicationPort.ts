import {
  RecommendedDeck,
  RecommendedDeckCreateDTO,
  RecommendedDeckUpdateDTO,
  RecommendedDeckWithCards,
} from "@/domain/RecommendedDeck.js";

/** Recommended deck port for guides */
export interface RecommendedDeckApplicationPort {
  /** Create a new deck for a guide */
  createDeck(data: RecommendedDeckCreateDTO): Promise<RecommendedDeck>;
  /** Get a guide deck by its instance ID */
  getDeckByInstanceId(instanceId: number): Promise<RecommendedDeckWithCards | null>;
  /** Update a guide deck by its instance ID */
  updateDeck(instanceId: number, data: RecommendedDeckUpdateDTO): Promise<RecommendedDeck>;
  /** Delete a guide deck by its instance ID */
  deleteDeck(instanceId: number): Promise<void>;
}
