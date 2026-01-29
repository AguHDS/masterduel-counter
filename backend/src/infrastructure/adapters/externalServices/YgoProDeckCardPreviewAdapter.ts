import { CardApiService, RawCardData } from "@/domain/ports/externalServices/CardApiService";

export class YgoProDeckCardPreviewAdapter implements CardApiService {
  private readonly baseUrl = "https://db.ygoprodeck.com/api/v7/cardinfo.php";

  async searchByName(name: string): Promise<RawCardData[]> {
    try {
      const url = `${this.baseUrl}?fname=${encodeURIComponent(name)}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404 || response.status === 400) {
          return [];
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.data.map((card: { id: number; name: string; card_images: unknown[] }) => ({
        id: card.id,
        name: card.name,
        card_images: card.card_images,
      }));
    } catch (error) {
      if (error instanceof Error && (error.message.includes("404") || error.message.includes("400"))) {
        return [];
      }
      throw new Error(`Failed to search cards: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async findById(id: number): Promise<RawCardData | null> {
    try {
      const url = `${this.baseUrl}?id=${id}`;
      const response = await fetch(url);

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
        card_images: card.card_images,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw new Error(`Failed to find card by ID: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new Error(`Failed to download image from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
