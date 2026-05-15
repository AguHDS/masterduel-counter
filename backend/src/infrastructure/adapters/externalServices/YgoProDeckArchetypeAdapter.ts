import { ArchetypeApiService } from "@/domain/ports/externalServices/ArchetypeApiService.js";

interface ArchetypeResponse {
  archetype_name: string;
}

/**
 * Adapter for YGOProDeck archetype API with in-memory caching
 * Cache TTL: 24 hours
 */
export class YgoProDeckArchetypeAdapter implements ArchetypeApiService {
  private cache: string[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly API_URL = "https://db.ygoprodeck.com/api/v7/archetypes.php";

  async getAllArchetypes(): Promise<string[]> {
    // Check if cache is valid
    if (this.cache && this.cacheTimestamp) {
      const now = Date.now();
      if (now - this.cacheTimestamp < this.CACHE_TTL_MS) {
        return this.cache;
      }
    }

    // Fetch fresh data from API
    try {
      const response = await fetch(this.API_URL);
      
      if (!response.ok) {
        throw new Error(`YGOProDeck API error: ${response.status}`);
      }

      const data: ArchetypeResponse[] = await response.json();
      
      // Extract archetype names and filter out empty ones
      const archetypeNames = data
        .map((item) => item.archetype_name)
        .filter((name) => name && name.trim() !== "");

      // Update cache
      this.cache = archetypeNames;
      this.cacheTimestamp = Date.now();

      return archetypeNames;
    } catch (error) {
      console.error("Error fetching archetypes from YGOProDeck:", error);
      
      // If we have stale cache, return it as fallback
      if (this.cache) {
        console.warn("Using stale archetype cache as fallback");
        return this.cache;
      }
      
      // Otherwise, return empty array
      return [];
    }
  }
}
