import { Archetype, ArchetypeUpdateDTO } from "../Archetype.js";

export interface GeneralStats {
  totalArchetypes: number;
  totalGuides: number;
  topArchetypes: Array<{
    id: number;
    name: string;
    guideCount: number;
  }>;
}

export interface ArchetypeRepository {
  /** Get total count of archetypes matching search term */
  getTotalSearchCount(searchTerm: string): Promise<number>;
  /** Search archetype by name
   * @searchTerm - Term to search for in archetype names
   * @limit - Maximum number of results to return (default = 50)
   */
  searchArchetypeByName(
    searchTerm: string,
    limit?: number,
  ): Promise<Archetype[]>;
  /** Autocomplete for archetype names when searching
   * @limit - Maximum number of results to return (default = 10)
   */
  searchAutocomplete(searchTerm: string, limit?: number): Promise<Archetype[]>;
  /** Find Archetype by ID */
  findArchetypeById(id: number): Promise<Archetype | null>;
  /** Find Archetype by name */
  findArchetypeByName(name: string): Promise<Archetype | null>;
  /** Find all registered archetypes */
  findAllRegisteredArchetypes(sortBy?: "recent" | "instances", guideType?: 'COUNTER' | 'DECK'): Promise<Archetype[]>;
  /** Update existing archetype. */
  updateExistingArchetype(
    id: number,
    archetypeData: ArchetypeUpdateDTO,
  ): Promise<Archetype | null>;
  /** Get general statistics */
  getGuidesGeneralStats(limit?: number, guideType?: 'COUNTER' | 'DECK'): Promise<GeneralStats>;
}