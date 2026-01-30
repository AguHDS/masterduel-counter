interface CardPair {
  id: string;
  topCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
  }>;
  bottomCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
  }>;
  effectiveness?: string;
  comment?: string;
}

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
}

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validateInstanceData = (
  pairs: CardPair[],
  headerCard: HeaderCard | null,
  title: string
): ValidationResult => {
  // Validate at least one pair
  if (pairs.length === 0) {
    return {
      isValid: false,
      errorMessage: "Please add at least one card pair before saving.",
    };
  }

  // Each pair must have at least one card in top or bottom
  for (const pair of pairs) {
    if ((pair.topCards.length === 0) && (pair.bottomCards.length === 0)) {
      return {
        isValid: false,
        errorMessage: "Each card pair must have at least one card in Top or Bottom.",
      };
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
    bottomCardIds: pair.bottomCards.map((card) => card.id),
    effectiveness: pair.effectiveness,
    comment: pair.comment,
  }));
};
