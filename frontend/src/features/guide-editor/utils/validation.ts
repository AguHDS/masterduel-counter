import type { CardPair } from "@/features/archetypes/types";
import type { GuideType } from "@/features/archetypes/types";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlCropped: string;
}

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validateInstanceData = (
  pairs: CardPair[],
  headerCard: HeaderCard | null,
  title: string,
  guideType?: GuideType,
): ValidationResult => {
  // Only validate pairs for COUNTER guides
  if (guideType === "COUNTER") {
    // Validate at least one pair
    if (pairs.length === 0) {
      return {
        isValid: false,
        errorMessage: "Please add at least one card pair before saving.",
      };
    }

    // Each pair must have at least one card in top or bottom
    for (const pair of pairs) {
      if (pair.topCards.length === 0 && pair.bottomCards.length === 0) {
        return {
          isValid: false,
          errorMessage:
            "Each card pair must have at least one card in Top or Bottom.",
        };
      }

      // Validate max 8 cards in top
      if (pair.topCards.length > 8) {
        return {
          isValid: false,
          errorMessage: "Each card pair can have maximum 8 top cards.",
        };
      }

      // Validate max 8 cards in bottom
      if (pair.bottomCards.length > 8) {
        return {
          isValid: false,
          errorMessage: "Each card pair can have maximum 8 bottom cards.",
        };
      }
    }
  }

  if (!headerCard) {
    return {
      isValid: false,
      errorMessage: "Please select a header card for this archetype.",
    };
  }

  if (!title || title.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: "Please provide a title for your guide.",
    };
  }

  if (title.length > 100) {
    return {
      isValid: false,
      errorMessage: "Title must be 100 characters or less.",
    };
  }

  return { isValid: true };
};

export const transformPairsForApi = (pairs: CardPair[]) => {
  return pairs.map((pair) => ({
    topCardIds: pair.topCards.map((card) => card.id),
    bottomCardIds: pair.bottomCards.map((card) => ({
      cardId: card.id,
      effectiveness: card.effectiveness,
    })),
    comment: pair.comment,
  }));
};
