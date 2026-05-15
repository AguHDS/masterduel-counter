/** External service for fetching archetype data from YGOProDeck API */
export interface ArchetypeApiService {
  /**
   * Get all archetypes from the external API
   * @returns Array of archetype names
   */
  getAllArchetypes(): Promise<string[]>;
}
