import { RecommendedDeck, RecommendedDeckCreateDTO, RecommendedDeckUpdateDTO } from "../RecommendedDeck";

export interface RecommendedDeckRepository {
  /** Create a recommended deck for a specific instance */
  createDeck(data: RecommendedDeckCreateDTO): Promise<RecommendedDeck>;
  findByInstanceId(instanceId: number): Promise<RecommendedDeck | null>;
  update(instanceId: number, data: RecommendedDeckUpdateDTO): Promise<RecommendedDeck>;
  delete(instanceId: number): Promise<void>;
}
