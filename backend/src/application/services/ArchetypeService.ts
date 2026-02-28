import { ArchetypeServicePort } from "@/application/ports/ArchetypeService";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";
import { Archetype } from "@/domain/Archetype";

export class ArchetypeService implements ArchetypeServicePort {
  private repository: ArchetypeRepository;

  constructor(repository: ArchetypeRepository) {
    this.repository = repository;
  }

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

  async getGeneralStats(limit: number = 15): Promise<import("@/domain/ports/ArchetypeRepository").GeneralStats> {
    return this.repository.getGeneralStats(limit);
  }
}
