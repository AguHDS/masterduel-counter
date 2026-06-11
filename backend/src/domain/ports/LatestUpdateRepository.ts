import type {
  LatestUpdate,
  LatestUpdateWithAuthor,
  CreateLatestUpdateDTO,
  UpdateLatestUpdateDTO,
} from "@/domain/LatestUpdate.js";

export interface LatestUpdateRepository {
  CreateLatestUpdate(data: CreateLatestUpdateDTO): Promise<LatestUpdate>;
  findLastestUpdateById(id: number): Promise<LatestUpdateWithAuthor | null>;
  findAllLastestUpdates(limit?: number): Promise<LatestUpdateWithAuthor[]>;
  findAllPaginatedLastestUpdates(
    page: number,
    limit: number,
  ): Promise<{ posts: LatestUpdateWithAuthor[]; total: number }>;
  updateLastestUpdate(id: number, data: UpdateLatestUpdateDTO): Promise<LatestUpdate>;
  deleteLastestUpdate(id: number): Promise<void>;
}
