import { getCardDetailsApplicationPort } from "@/application/ports/GetCardDetailsApplicationPort.js";
import { CardDetailsApiService, CardDetails } from "@/domain/ports/externalServices/CardDetailsApiService.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";

export class GetCardDetailsApplicationService implements getCardDetailsApplicationPort {
  constructor(
    private readonly cardDetailsApi: CardDetailsApiService,
    private readonly cardRepository: CardRepository,
  ) {}

  /** 
   * Get card details by ID for tooltip display
   * First checks local DB for card with local images, otherwise fetches from external API
   */
  async getCardDetails(cardId: number): Promise<CardDetails | null> {
    // Check if card exists locally with images already downloaded
    const localCard = await this.cardRepository.finCardById(cardId);
    
    if (localCard) {
      // Card exists in DB with local images, return local data with full details
      return {
        id: localCard.id,
        name: localCard.name,
        type: localCard.type,
        desc: localCard.desc,
        race: localCard.race,
        attribute: localCard.attribute,
        atk: localCard.atk,
        def: localCard.def,
        level: localCard.level,
        scale: localCard.scale,
        linkval: localCard.linkval,
        linkmarkers: localCard.linkmarkers ? JSON.parse(localCard.linkmarkers) : undefined,
        archetype: localCard.archetype,
        card_images: [
          {
            image_url: localCard.imageUrl,
            image_url_small: localCard.imageUrlSmall,
            image_url_cropped: localCard.imageUrlCropped,
          },
        ],
      };
    }

    // Card not in local DB, fetch from external API (temporary preview for search tooltips)
    return await this.cardDetailsApi.getCardDetailsFromExternalApi(cardId);
  }
}
