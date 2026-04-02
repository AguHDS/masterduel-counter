import { getCardDetailsApplicationPort } from "@/application/ports/GetCardDetailsApplicationPort.js";
import { CardDetailsApiService, CardDetails } from "@/domain/ports/externalServices/CardDetailsApiService.js";

export class GetCardDetailsApplicationService implements getCardDetailsApplicationPort {
  constructor(private readonly cardDetailsApi: CardDetailsApiService) {}

  /** Get card details by ID from external API (for hover tooltip) */
  async getCardDetails(cardId: number): Promise<CardDetails | null> {
    return await this.cardDetailsApi.getCardDetailsFromExternalApi(cardId);
  }
}
