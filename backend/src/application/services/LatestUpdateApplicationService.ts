import type { LatestUpdateRepository } from "@/domain/ports/LatestUpdateRepository.js";
import type {
  LatestUpdateApplicationPort,
  PaginatedLatestUpdates,
} from "@/application/ports/LatestUpdateApplicationPort.js";
import type {
  LatestUpdate,
  LatestUpdateWithAuthor,
  CreateLatestUpdateDTO,
  UpdateLatestUpdateDTO,
} from "@/domain/LatestUpdate.js";

export class LatestUpdateApplicationService
  implements LatestUpdateApplicationPort
{
  constructor(
    private readonly latestUpdateRepository: LatestUpdateRepository,
  ) {}

  async CreateLatestUpdate(data: CreateLatestUpdateDTO): Promise<LatestUpdate> {
    return this.latestUpdateRepository.CreateLatestUpdate(data);
  }

  async findLastestUpdateById(id: number): Promise<LatestUpdateWithAuthor | null> {
    return this.latestUpdateRepository.findLastestUpdateById(id);
  }

  async findAllLastestUpdates(limit?: number): Promise<LatestUpdateWithAuthor[]> {
    return this.latestUpdateRepository.findAllLastestUpdates(limit);
  }

  async findAllPaginatedLastestUpdates(
    page: number,
    limit: number = 20,
  ): Promise<PaginatedLatestUpdates> {
    const result = await this.latestUpdateRepository.findAllPaginatedLastestUpdates(
      page,
      limit,
    );
    return {
      ...result,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async updateLastestUpdate(
    id: number,
    data: UpdateLatestUpdateDTO,
  ): Promise<LatestUpdate> {
    return this.latestUpdateRepository.updateLastestUpdate(id, data);
  }

  async deleteLastestUpdate(id: number): Promise<void> {
    return this.latestUpdateRepository.deleteLastestUpdate(id);
  }
}
