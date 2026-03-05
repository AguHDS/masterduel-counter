import { RecommendedDeck, RecommendedDeckCreateDTO, RecommendedDeckUpdateDTO } from "../RecommendedDeck.js";

export interface RecommendedDeckRepository {
  /** Create a recommended deck for a specific instance */
  createDeck(data: RecommendedDeckCreateDTO): Promise<RecommendedDeck>;
  /** Find recommended deck by instance ID */
  getDeckByInstanceId(instanceId: number): Promise<RecommendedDeck | null>;
  /** Update a recommended deck by instance ID */
  updateDeck(instanceId: number, data: RecommendedDeckUpdateDTO): Promise<RecommendedDeck>;
  /** Delete a recommended deck by instance ID */
  deleteDeck(instanceId: number): Promise<void>;
}
