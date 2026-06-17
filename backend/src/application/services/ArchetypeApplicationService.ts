import { ArchetypeApplicationPort } from "@/application/ports/ArchetypeApplicationPort.js";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository.js";
import { Archetype } from "@/domain/Archetype.js";
import { ArchetypeApiService } from "@/domain/ports/externalServices/ArchetypeApiService.js";

export class ArchetypeApplicationService implements ArchetypeApplicationPort {
  private repository: ArchetypeRepository;
  private archetypeApiService: ArchetypeApiService;

  constructor(repository: ArchetypeRepository, archetypeApiService: ArchetypeApiService) {
    this.repository = repository;
    this.archetypeApiService = archetypeApiService;
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
    
    // On-demand sync: If no results found and search term is >= 3 chars, check external API
    if (archetypes.length === 0 && trimmedTerm.length >= 1) {
      try {
        // Get all archetypes from external API (cached for 24h)
        const externalArchetypes = await this.archetypeApiService.getAllArchetypes();
        
        // Find matching archetypes that aren't in our DB yet
        const matchingArchetypes = externalArchetypes.filter((name) =>
          name.toLowerCase().includes(trimmedTerm.toLowerCase())
        );
        
        // Insert new archetypes into DB
        const insertedCount = await this.syncArchetypesToDatabase(matchingArchetypes);
        
        if (insertedCount > 0) {
          // Re-run the search to get the newly inserted archetypes
          archetypes = await this.repository.searchArchetypeByName(trimmedTerm, limit);
        }
      } catch (error) {
        // Log error but don't fail the search - just return empty results
        console.error("Error during on-demand archetype sync:", error);
      }
    }
    
    // Get total count without limit
    const total = await this.repository.getTotalSearchCount(trimmedTerm);
    
    return { archetypes, total };
  }

  /** Sync archetypes from external API to database */
  private async syncArchetypesToDatabase(archetypeNames: string[]): Promise<number> {
    let insertedCount = 0;
    
    for (const name of archetypeNames) {
      // Check if archetype already exists
      const existing = await this.repository.findArchetypeByName(name);
      
      if (!existing) {
        // Insert new archetype
        const created = await this.repository.createArchetype(name);
        if (created) {
          insertedCount++;
        }
      }
    }
    
    return insertedCount;
  }

  /** Get Guides general stats */
  async getGuidesGeneralStats(limit: number = 15, guideType?: 'COUNTER' | 'DECK'): Promise<import("@/domain/ports/ArchetypeRepository.js").GeneralStats> {
    return this.repository.getGuidesGeneralStats(limit, guideType);
  }

  /** Get all archetypes for admin pannel */
  async getAllArchetypes(search?: string): Promise<Archetype[]> {
    if (search && search.trim()) {
      return this.repository.searchArchetypeByName(search.trim(), 100);
    }
    return this.repository.findAllRegisteredArchetypes("recent");
  }

  /** Create a new archetype - for admin pannel */
  async createArchetype(name: string): Promise<Archetype | null> {
    return this.repository.createArchetype(name);
  }

  /** Deletes an archetype from our system - Admin Pannel */
  async deleteArchetype(id: number): Promise<boolean> {
    return this.repository.deleteArchetype(id);
  }

  /** Renames an archetype — Admin Panel */
  async updateArchetype(id: number, name: string): Promise<Archetype | null> {
    const existing = await this.repository.findArchetypeByName(name);
    if (existing && existing.id !== id) return null;
    return this.repository.updateExistingArchetype(id, { name });
  }
}