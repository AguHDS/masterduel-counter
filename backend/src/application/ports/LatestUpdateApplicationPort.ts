import type {
  LatestUpdate,
  LatestUpdateWithAuthor,
  CreateLatestUpdateDTO,
  UpdateLatestUpdateDTO,
} from "@/domain/LatestUpdate.js";

export interface PaginatedLatestUpdates {
  posts: LatestUpdateWithAuthor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LatestUpdateApplicationPort {
  CreateLatestUpdate(data: CreateLatestUpdateDTO): Promise<LatestUpdate>;
  findLastestUpdateById(id: number): Promise<LatestUpdateWithAuthor | null>;
  findAllLastestUpdates(limit?: number): Promise<LatestUpdateWithAuthor[]>;
  findAllPaginatedLastestUpdates(
    page: number,
    limit?: number,
  ): Promise<PaginatedLatestUpdates>;
  updateLastestUpdate(id: number, data: UpdateLatestUpdateDTO): Promise<LatestUpdate>;
  deleteLastestUpdate(id: number): Promise<void>;
}
