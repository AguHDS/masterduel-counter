import {
  Archetype,
} from "@/domain/Archetype.js";
import { GeneralStats } from "@/domain/ports/ArchetypeRepository.js";

export interface ArchetypeServicePort {
  /**
   * Searches archetypes by a search term using partial matching
   * @param searchTerm - Search term (partial or full name)
   * @param limit - Maximum number of results (optional)
   * @returns Array of archetypes that match the search term
   */
  searchArchetypes(searchTerm: string, limit?: number): Promise<Archetype[]>;
  /**
   * Gets general statistics about archetypes and guides
   * @param limit - Maximum number of top archetypes to return (default: 15)
   * @returns General statistics including total archetypes, guides, and top archetypes
   */
  getGeneralStats(limit?: number): Promise<GeneralStats>;
}
