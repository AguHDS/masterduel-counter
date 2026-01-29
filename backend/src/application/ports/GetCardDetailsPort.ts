import { CardDetails } from "@/domain/ports/externalServices/CardDetailsApiService";

export interface GetCardDetailsPort {
  execute(cardId: number): Promise<CardDetails | null>;
}
