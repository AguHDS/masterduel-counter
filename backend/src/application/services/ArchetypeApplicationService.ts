import { ArchetypeApplicationPort } from "@/application/ports/ArchetypeApplicationPort.js";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository.js";
import { Archetype } from "@/domain/Archetype.js";

export class ArchetypeApplicationService implements ArchetypeApplicationPort {
  private repository: ArchetypeRepository;

  constructor(repository: ArchetypeRepository) {
    this.repository = repository;
  }

  /** Search archetypes (for search functionality) */
  async searchArchetypes(
    searchTerm: string,
    limit: number = 50,
  ): Promise<Archetype[]> {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }

    const trimmedTerm = searchTerm.trim();

    if (trimmedTerm.length < 3) {
      return this.repository.searchAutocomplete(trimmedTerm, limit);
    }

    return this.repository.searchArchetypeByName(trimmedTerm, limit);
  }

  /** Get Guides general stats */
  async getGuidesGeneralStats(limit: number = 15): Promise<import("@/domain/ports/ArchetypeRepository.js").GeneralStats> {
    return this.repository.getGuidesGeneralStats(limit);
  }
}
