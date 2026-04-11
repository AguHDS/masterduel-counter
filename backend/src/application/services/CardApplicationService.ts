import { CardApplicationPort } from "@/application/ports/CardApplicationPort.js";
import { CardSearchResult, CardPreviewDTO, Card } from "@/domain/Card.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";
import { CardApiService } from "@/domain/ports/externalServices/CardApiService.js";

export class CardApplicationService implements CardApplicationPort {
  constructor(
    private cardRepository: CardRepository,
    private cardApiService: CardApiService,
  ) {}

  async searchCards(query: string): Promise<CardSearchResult[]> {
    const cards = await this.cardApiService.searchCardByNameFromExternalApi(query);

    return cards.map((card) => ({
      id: card.id,
      name: card.name,
      imageUrlExternal: card.card_images?.[0]?.image_url,
      imageUrlSmallExternal: card.card_images?.[0]?.image_url_small,
      imageUrlCroppedExternal: card.card_images?.[0]?.image_url_cropped,
      frameType: card.frameType,
      level: card.level,
    }));
  }

  async selectCard(cardId: number): Promise<CardPreviewDTO> {
    // Check if card already exists in database with frameType populated
    const existingCard = await this.cardRepository.finCardById(cardId);

    if (existingCard && existingCard.frameType !== undefined) {
      return {
        id: existingCard.id,
        name: existingCard.name,
        imageUrl: existingCard.imageUrl,
        imageUrlSmall: existingCard.imageUrlSmall,
        imageUrlCropped: existingCard.imageUrlCropped,
        frameType: existingCard.frameType,
        level: existingCard.level,
      };
    }

    // Card doesn't exist OR exists without frameType - fetch from YGOProdeck API
    const cardData = await this.cardApiService.findCardByIdFromExternalApi(cardId);

    if (!cardData) {
      throw new Error(`Card with ID ${cardId} not found`);
    }

    if (!cardData.card_images || cardData.card_images.length === 0) {
      throw new Error(`Card ${cardId} has no images`);
    }

    const imageData = cardData.card_images[0];

    // Create card entity storing YGOProdeck URLs directly (no upload needed)
    const card: Card = {
      id: cardId,
      name: cardData.name,
      imageUrl: imageData.image_url,
      imageUrlSmall: imageData.image_url_small,
      imageUrlCropped: imageData.image_url_cropped,
      frameType: cardData.frameType,
      level: cardData.level,
      createdAt: existingCard?.createdAt ?? new Date().toISOString(),
    };

    await this.cardRepository.saveOrUpdateCard(card);

    return {
      id: card.id,
      name: card.name,
      imageUrl: card.imageUrl,
      imageUrlSmall: card.imageUrlSmall,
      imageUrlCropped: card.imageUrlCropped,
      frameType: card.frameType,
      level: card.level,
    };
  }

  async confirmSelectedCards(cardIds: number[]): Promise<void> {
    // Cards selected in UI exist only in browser memory until this method is called
    // This method ensures all cards exist in DB with frameType populated
    // If card exists but lacks frameType (old card), selectCard re-fetches to backfill
    // TODO: Check if this description is accurate and up to date, since we use Ygoprodeck api to fetch cards with hotlink.

    for (const cardId of cardIds) {
      const existingCard = await this.cardRepository.finCardById(cardId);

      if (!existingCard || existingCard.frameType === undefined) {
        try {
          await this.selectCard(cardId); // Fetches and stores card URLs from YGOProdeck
        } catch (error) {
          throw new Error(`Failed to create card ${cardId}` + (error instanceof Error ? `: ${error.message}` : ""));
        }
      }
    }
  }


}
