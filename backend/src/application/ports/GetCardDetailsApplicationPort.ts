import { CardDetails } from "@/domain/ports/externalServices/CardDetailsApiService.js";

export interface getCardDetailsApplicationPort {
  /** Get card details by ID from external API (for hover tooltip) */
  getCardDetails(cardId: number): Promise<CardDetails | null>;
}