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
  ): Promise<{ archetypes: Archetype[]; total: number }> {
    if (!searchTerm || searchTerm.trim() === "") {
      return { archetypes: [], total: 0 };
    }

    const trimmedTerm = searchTerm.trim();
    let archetypes: Archetype[];
    
    if (trimmedTerm.length < 3) {
      archetypes = await this.repository.searchAutocomplete(trimmedTerm, limit);
    } else {
      archetypes = await this.repository.searchArchetypeByName(trimmedTerm, limit);
    }
    
    // Get total count without limit
    const total = await this.repository.getTotalSearchCount(trimmedTerm);
    
    return { archetypes, total };
  }

  /** Get Guides general stats */
  async getGuidesGeneralStats(limit: number = 15): Promise<import("@/domain/ports/ArchetypeRepository.js").GeneralStats> {
    return this.repository.getGuidesGeneralStats(limit);
  }
}