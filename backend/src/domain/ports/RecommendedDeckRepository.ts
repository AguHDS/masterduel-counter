import { RecommendedDeck, RecommendedDeckCreateDTO, RecommendedDeckUpdateDTO } from "../RecommendedDeck";

export interface RecommendedDeckRepository {
  create(data: RecommendedDeckCreateDTO): Promise<RecommendedDeck>;
  findByInstanceId(instanceId: number): Promise<RecommendedDeck | null>;
  update(instanceId: number, data: RecommendedDeckUpdateDTO): Promise<RecommendedDeck>;
  delete(instanceId: number): Promise<void>;
}
