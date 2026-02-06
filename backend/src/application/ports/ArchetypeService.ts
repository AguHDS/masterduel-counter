import {
  Archetype,
} from "@/domain/Archetype";

export interface ArchetypeServicePort {
  /**
   * Searches archetypes by a search term using partial matching
   * @param searchTerm - Search term (partial or full name)
   * @param limit - Maximum number of results (optional)
   * @returns Array of archetypes that match the search term
   */
  searchArchetypes(searchTerm: string, limit?: number): Promise<Archetype[]>;
}
