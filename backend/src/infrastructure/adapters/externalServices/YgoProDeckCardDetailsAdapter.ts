import { CardDetailsApiService, CardDetails } from "@/domain/ports/externalServices/CardDetailsApiService.js";

export class YgoProDeckCardDetailsAdapter implements CardDetailsApiService {
  private readonly baseUrl = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
  private readonly timeout = 10000; // 10 seconds

  /**
   * Fetch with timeout to prevent hanging requests
   * @param url - URL to fetch
   * @param timeoutMs - Timeout in milliseconds
   */
  private async fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: YGOProdeck API is not responding');
      }
      throw error;
    }
  }

  /** Get detailed information about a card by its ID from external API (for hover tooltip) */
  async getCardDetailsFromExternalApi(id: number): Promise<CardDetails | null> {
    try {
      const url = `${this.baseUrl}?id=${id}`;
      const response = await this.fetchWithTimeout(url, this.timeout);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        return null;
      }

      const card = data.data[0];
      
      return {
        id: card.id,
        name: card.name,
        type: card.type,
        desc: card.desc,
        atk: card.atk,
        def: card.def,
        level: card.level,
        race: card.race,
        attribute: card.attribute,
        archetype: card.archetype,
        scale: card.scale,
        linkval: card.linkval,
        linkmarkers: card.linkmarkers,
        card_images: card.card_images,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw new Error(`Failed to get card details: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
