import { CardDetails } from "@/domain/ports/externalServices/CardDetailsApiService";

export interface GetCardDetailsPort {
  /** Get card details by ID from external API (for hover tooltip) */
  execute(cardId: number): Promise<CardDetails | null>;
}
