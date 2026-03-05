import { GetCardDetailsPort } from "@/application/ports/GetCardDetailsPort.js";
import { CardDetailsApiService, CardDetails } from "@/domain/ports/externalServices/CardDetailsApiService.js";

export class GetCardDetailsService implements GetCardDetailsPort {
  constructor(private readonly cardDetailsApi: CardDetailsApiService) {}

  async execute(cardId: number): Promise<CardDetails | null> {
    return await this.cardDetailsApi.getCardDetailsFromExternalApi(cardId);
  }
}
