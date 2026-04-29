import { CardApplicationPort } from "@/application/ports/CardApplicationPort.js";
import { CardSearchResult, CardPreviewDTO, Card } from "@/domain/Card.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";
import { CardApiService } from "@/domain/ports/externalServices/CardApiService.js";
import { CardImageStorageService } from "@/services/cardImageStorageService.js";

export class CardApplicationService implements CardApplicationPort {
  constructor(
    private cardRepository: CardRepository,
    private cardApiService: CardApiService,
    private cardImageStorage: CardImageStorageService,
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
      // Card exists with all data, return local URLs
      return {
        id: existingCard.id,
        name: existingCard.name,
        type: existingCard.type,
        desc: existingCard.desc,
        race: existingCard.race,
        attribute: existingCard.attribute,
        atk: existingCard.atk,
        def: existingCard.def,
        level: existingCard.level,
        scale: existingCard.scale,
        linkval: existingCard.linkval,
        linkmarkers: existingCard.linkmarkers,
        archetype: existingCard.archetype,
        imageUrl: existingCard.imageUrl,
        imageUrlSmall: existingCard.imageUrlSmall,
        imageUrlCropped: existingCard.imageUrlCropped,
        frameType: existingCard.frameType,
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

    // Download and save images locally (lazy loading)
    // This downloads all 3 versions (normal, small, cropped) and returns local API URLs
    const localImageUrls = await this.cardImageStorage.downloadAndSaveCardImages(cardId, {
      normal: imageData.image_url,
      small: imageData.image_url_small,
      cropped: imageData.image_url_cropped,
    });

    // Create card entity with local URLs and all card details
    const card: Card = {
      id: cardId,
      name: cardData.name,
      type: cardData.type ?? "Unknown",
      desc: cardData.desc ?? "",
      race: cardData.race ?? "Unknown",
      attribute: cardData.attribute,
      atk: cardData.atk,
      def: cardData.def,
      level: cardData.level,
      scale: cardData.scale,
      linkval: cardData.linkval,
      linkmarkers: cardData.linkmarkers ? JSON.stringify(cardData.linkmarkers) : undefined,
      archetype: cardData.archetype,
      imageUrl: localImageUrls.imageUrl,
      imageUrlSmall: localImageUrls.imageUrlSmall,
      imageUrlCropped: localImageUrls.imageUrlCropped,
      frameType: cardData.frameType,
      createdAt: existingCard?.createdAt ?? new Date().toISOString(),
    };

    await this.cardRepository.saveOrUpdateCard(card);

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
      imageUrl: card.imageUrl,
      imageUrlSmall: card.imageUrlSmall,
      imageUrlCropped: card.imageUrlCropped,
      frameType: card.frameType,
    };
  }

  async confirmSelectedCards(cardIds: number[]): Promise<void> {
    // Cards selected in UI exist only in browser memory until this method is called
    // This method ensures all cards exist in DB with frameType populated and images downloaded locally
    // If card exists but lacks frameType (old card), selectCard re-fetches and downloads images

    for (const cardId of cardIds) {
      const existingCard = await this.cardRepository.finCardById(cardId);

      if (!existingCard || existingCard.frameType === undefined) {
        try {
          await this.selectCard(cardId); // Fetches data and downloads images to local storage
        } catch (error) {
          throw new Error(`Failed to create card ${cardId}` + (error instanceof Error ? `: ${error.message}` : ""));
        }
      }
    }
  }


}
