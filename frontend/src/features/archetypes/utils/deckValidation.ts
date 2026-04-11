type CardWithIdentity = {
  id: number;
  name: string;
};

export type DeckZone = "main" | "extra" | "side";

const MAX_COPIES_PER_CARD = 3;

const DECK_ZONE_LIMITS: Record<DeckZone, number> = {
  main: 60,
  extra: 15,
  side: 20,
};

const DECK_ZONE_LIMIT_MESSAGES: Record<DeckZone, string> = {
  main: "Main deck cannot have more than 60 cards",
  extra: "Extra deck cannot have more than 15 cards",
  side: "Side deck cannot have more than 20 cards",
};

interface ValidateDeckCardAdditionParams<TCard extends CardWithIdentity> {
  card: TCard;
  targetZone: DeckZone;
  mainDeck: TCard[];
  extraDeck: TCard[];
  sideDeck?: TCard[];
}

export const validateDeckCardAddition = <TCard extends CardWithIdentity>({
  card,
  targetZone,
  mainDeck,
  extraDeck,
  sideDeck = [],
}: ValidateDeckCardAdditionParams<TCard>): string | null => {
  const existingCopies = [mainDeck, extraDeck, sideDeck]
    .flat()
    .filter((deckCard) => deckCard.id === card.id).length;

  if (existingCopies >= MAX_COPIES_PER_CARD) {
    return `You can only have a maximum of 3 copies of "${card.name}" in your deck`;
  }

  const zoneCards = targetZone === "main"
    ? mainDeck
    : targetZone === "extra"
      ? extraDeck
      : sideDeck;

  if (zoneCards.length >= DECK_ZONE_LIMITS[targetZone]) {
    return DECK_ZONE_LIMIT_MESSAGES[targetZone];
  }

  return null;
};