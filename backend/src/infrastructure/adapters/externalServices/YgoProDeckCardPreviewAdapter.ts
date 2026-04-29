import {
  CardApiService,
  RawCardData,
} from "@/domain/ports/externalServices/CardApiService.js";

export class YgoProDeckCardPreviewAdapter implements CardApiService {
  private readonly baseUrl = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
  private readonly timeout = 10000; // 10 seconds

  /**
   * Fetch with timeout to prevent hanging requests
   * @param url - URL to fetch
   * @param timeoutMs - Timeout in milliseconds
   */
  private async fetchWithTimeout(
    url: string,
    timeoutMs: number,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout: YGOProdeck API is not responding");
      }
      throw error;
    }
  }

  async searchCardByNameFromExternalApi(name: string): Promise<RawCardData[]> {
    try {
      const url = `${this.baseUrl}?fname=${encodeURIComponent(name)}`;
      const response = await this.fetchWithTimeout(url, this.timeout);

      if (!response.ok) {
        if (response.status === 404 || response.status === 400) {
          return [];
        }
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      return data.data.map(
        (card: {
          id: number;
          name: string;
          type?: string;
          desc?: string;
          race?: string;
          attribute?: string;
          atk?: number;
          def?: number;
          level?: number;
          scale?: number;
          linkval?: number;
          linkmarkers?: string[];
          archetype?: string;
          frameType?: string;
          card_images: unknown[];
        }) => ({
          id: card.id,
          name: card.name,
          type: card.type,
          desc: card.desc,
          race: card.race,
          attribute: card.attribute,
          atk: card.atk,
          def: card.def,
          level: card.level,
          scale: card.scale,
          linkval: card.linkval,
          linkmarkers: card.linkmarkers,
          archetype: card.archetype,
          frameType: card.frameType,
          card_images: card.card_images,
        }),
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("404") || error.message.includes("400"))
      ) {
        return [];
      }
      throw new Error(
        `Failed to search cards: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async findCardByIdFromExternalApi(id: number): Promise<RawCardData | null> {
    try {
      const url = `${this.baseUrl}?id=${id}`;
      const response = await this.fetchWithTimeout(url, this.timeout);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
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
        race: card.race,
        attribute: card.attribute,
        atk: card.atk,
        def: card.def,
        level: card.level,
        scale: card.scale,
        linkval: card.linkval,
        linkmarkers: card.linkmarkers,
        archetype: card.archetype,
        frameType: card.frameType,
        card_images: card.card_images,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw new Error(
        `Failed to find card by ID: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
