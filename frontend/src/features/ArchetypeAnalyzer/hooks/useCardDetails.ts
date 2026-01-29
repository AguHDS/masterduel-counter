import { useQuery } from "@tanstack/react-query";
import { cardDetailsApi, type CardDetails } from "../api/cardDetailsApi";

/** For detailed card information on hover */
export const useCardDetails = (cardId: number | null) => {
  return useQuery<CardDetails, Error>({
    queryKey: ["cardDetails", cardId],
    queryFn: () => {
      if (!cardId) throw new Error("Card ID is required");
      return cardDetailsApi.getCardDetails(cardId);
    },
    enabled: !!cardId,
    staleTime: 1000 * 60 * 30, // 30 minutes (card data doesn't change often)
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};
