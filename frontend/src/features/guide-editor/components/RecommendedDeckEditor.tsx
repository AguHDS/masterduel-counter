import { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { FloatingCardSearchModal } from "./FloatingCardSearchModal";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";

interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

interface RecommendedDeckEditorProps {
  isEditMode: boolean;
  initialTitle?: string;
  initialMainDeck?: Card[];
  initialExtraDeck?: Card[];
  initialSideDeck?: Card[];
  onDeckChange?: (title: string, mainDeck: Card[], extraDeck: Card[], sideDeck: Card[]) => void;
  onDelete?: () => Promise<void>;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
}

type DeckZone = "main" | "extra" | "side" | null;

export const RecommendedDeckEditor = ({
  isEditMode,
  initialTitle = "Recommended Deck",
  initialMainDeck = [],
  initialExtraDeck = [],
  initialSideDeck = [],
  onDeckChange,
  onDelete,
  onModalStateChange,
  forceCloseModal = false,
}: RecommendedDeckEditorProps) => {
  const [title, setTitle] = useState<string>(initialTitle);
  const [mainDeck, setMainDeck] = useState<Card[]>(initialMainDeck);
  const [extraDeck, setExtraDeck] = useState<Card[]>(initialExtraDeck);
  const [sideDeck, setSideDeck] = useState<Card[]>(initialSideDeck);
  const [showSideDeck, setShowSideDeck] = useState<boolean>(initialSideDeck.length > 0);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [targetZone, setTargetZone] = useState<DeckZone>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedCard, setDraggedCard] = useState<{ zone: "main" | "extra" | "side"; index: number } | null>(null);

  // Close modal when forced from parent
  useEffect(() => {
    if (forceCloseModal && isSelectingCard) {
      setIsSelectingCard(false);
      setTargetZone(null);
    }
  }, [forceCloseModal]);

  // Notify parent when modal state changes
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(isSelectingCard);
    }
  }, [isSelectingCard, onModalStateChange]);

  const hasDeck = mainDeck.length > 0 || extraDeck.length > 0 || sideDeck.length > 0;

  useEffect(() => {
    if (
      !isEditMode ||
      JSON.stringify(mainDeck) !== JSON.stringify(initialMainDeck)
    ) {
      setMainDeck(initialMainDeck);
    }
  }, [initialMainDeck, isEditMode]);

  useEffect(() => {
    if (
      !isEditMode ||
      JSON.stringify(extraDeck) !== JSON.stringify(initialExtraDeck)
    ) {
      setExtraDeck(initialExtraDeck);
    }
  }, [initialExtraDeck, isEditMode]);

  useEffect(() => {
    if (
      !isEditMode ||
      JSON.stringify(sideDeck) !== JSON.stringify(initialSideDeck)
    ) {
      setSideDeck(initialSideDeck);
      setShowSideDeck(initialSideDeck.length > 0);
    }
  }, [initialSideDeck, isEditMode]);

  useEffect(() => {
    if (!isEditMode || title !== initialTitle) {
      setTitle(initialTitle);
    }
  }, [initialTitle, isEditMode]);

  const handleAddCard = (zone: DeckZone, anchor: HTMLElement) => {
    setAnchorElement(anchor);
    setTargetZone(zone);
    setIsSelectingCard(true);
  };

  const handleCardSelected = (card: Card) => {
    if (targetZone === "main") {
      if (mainDeck.length >= 60) {
        alert("Main deck cannot have more than 60 cards");
        return;
      }
      const newMainDeck = [...mainDeck, card];
      setMainDeck(newMainDeck);
      if (onDeckChange) {
        onDeckChange(title, newMainDeck, extraDeck, sideDeck);
      }
    } else if (targetZone === "extra") {
      if (extraDeck.length >= 15) {
        alert("Extra deck cannot have more than 15 cards");
        return;
      }
      const newExtraDeck = [...extraDeck, card];
      setExtraDeck(newExtraDeck);
      if (onDeckChange) {
        onDeckChange(title, mainDeck, newExtraDeck, sideDeck);
      }
    } else if (targetZone === "side") {
      if (sideDeck.length >= 20) {
        alert("Side deck cannot have more than 20 cards");
        return;
      }
      const newSideDeck = [...sideDeck, card];
      setSideDeck(newSideDeck);
      if (onDeckChange) {
        onDeckChange(title, mainDeck, extraDeck, newSideDeck);
      }
    }
  };

  const handleRemoveCard = (zone: "main" | "extra" | "side", index: number) => {
    if (zone === "main") {
      const newMainDeck = mainDeck.filter((_, i) => i !== index);
      setMainDeck(newMainDeck);
      if (onDeckChange) {
        onDeckChange(title, newMainDeck, extraDeck, sideDeck);
      }
    } else if (zone === "extra") {
      const newExtraDeck = extraDeck.filter((_, i) => i !== index);
      setExtraDeck(newExtraDeck);
      if (onDeckChange) {
        onDeckChange(title, mainDeck, newExtraDeck, sideDeck);
      }
    } else if (zone === "side") {
      const newSideDeck = sideDeck.filter((_, i) => i !== index);
      setSideDeck(newSideDeck);
      if (onDeckChange) {
        onDeckChange(title, mainDeck, extraDeck, newSideDeck);
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (zone: "main" | "extra" | "side", index: number) => {
    setDraggedCard({ zone, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (zone: "main" | "extra" | "side", dropIndex: number) => {
    if (!draggedCard) return;

    // Only allow reordering within the same zone
    if (draggedCard.zone !== zone) return;

    // Don't do anything if dropping in the same position
    if (draggedCard.index === dropIndex) {
      setDraggedCard(null);
      return;
    }

    if (zone === "main") {
      const newMainDeck = [...mainDeck];
      // Swap the cards
      const temp = newMainDeck[draggedCard.index];
      newMainDeck[draggedCard.index] = newMainDeck[dropIndex];
      newMainDeck[dropIndex] = temp;
      
      setMainDeck(newMainDeck);
      if (onDeckChange) {
        onDeckChange(title, newMainDeck, extraDeck, sideDeck);
      }
    } else if (zone === "extra") {
      const newExtraDeck = [...extraDeck];
      // Swap the cards
      const temp = newExtraDeck[draggedCard.index];
      newExtraDeck[draggedCard.index] = newExtraDeck[dropIndex];
      newExtraDeck[dropIndex] = temp;
      
      setExtraDeck(newExtraDeck);
      if (onDeckChange) {
        onDeckChange(title, mainDeck, newExtraDeck, sideDeck);
      }
    } else if (zone === "side") {
      const newSideDeck = [...sideDeck];
      // Swap the cards
      const temp = newSideDeck[draggedCard.index];
      newSideDeck[draggedCard.index] = newSideDeck[dropIndex];
      newSideDeck[dropIndex] = temp;
      
      setSideDeck(newSideDeck);
      if (onDeckChange) {
        onDeckChange(title, mainDeck, extraDeck, newSideDeck);
      }
    }

    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleAddSideDeck = () => {
    setShowSideDeck(true);
  };

  const handleRemoveSideDeck = () => {
    if (sideDeck.length > 0) {
      const confirmed = confirm("Remove all cards from side deck?");
      if (!confirmed) return;
    }
    setSideDeck([]);
    setShowSideDeck(false);
    if (onDeckChange) {
      onDeckChange(title, mainDeck, extraDeck, []);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = confirm(
      "Are you sure you want to delete the recommended deck?",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete();
      setMainDeck([]);
      setExtraDeck([]);
      setSideDeck([]);
      setTitle("Recommended Deck");
    } catch (error) {
      console.error("Error deleting deck:", error);
      alert("Failed to delete deck. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isEditMode && !hasDeck) {
    return null;
  }

  if (!isEditMode && hasDeck) {
    return (
      <div className="flex justify-center mt-8">
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-full" style={{ maxWidth: "56%" }}>
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-white">
              {title}
            </h4>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-full h-px bg-blue-500/30"></div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="bg-blue-900/30 px-3 py-2 rounded border-l-4 border-blue-500">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-base">
                    Main Deck
                  </span>
                  <span className="text-blue-300 text-sm">
                    ({mainDeck.length})
                  </span>
                </div>
              </div>
              <div
                className="grid gap-1 p-1.5 bg-blue-950/30 rounded border border-blue-500/30"
                style={{
                  gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                }}
              >
                {mainDeck.map((card, index) => (
                  <CardTooltip
                    key={`main-${index}`}
                    cardId={card.id}
                    imageUrl={card.imageUrl}
                    cardName={card.name}
                    disabled={!!draggedCard}
                  >
                    <img
                      src={card.imageUrlSmall}
                      alt={card.name}
                      className="w-full h-auto border border-slate-600 hover:border-blue-400 transition-colors object-contain cursor-pointer"
                    />
                  </CardTooltip>
                ))}
              </div>
            </div>

            {extraDeck.length > 0 && (
              <div className="space-y-3">
                <div className="bg-purple-900/30 px-3 py-2 rounded border-l-4 border-purple-500">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-base">
                      Extra Deck
                    </span>
                    <span className="text-purple-300 text-sm">
                      ({extraDeck.length})
                    </span>
                  </div>
                </div>
                <div 
                  className="grid gap-1 p-1.5 bg-purple-950/30 rounded border border-purple-500/30"
                  style={{
                    gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                  }}
                >
                  {extraDeck.map((card, index) => (
                    <CardTooltip
                      key={`extra-${index}`}
                      cardId={card.id}
                      imageUrl={card.imageUrl}
                      cardName={card.name}
                      disabled={!!draggedCard}
                    >
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        className="w-full h-auto border border-purple-600/30 hover:border-purple-400 transition-colors object-contain cursor-pointer"
                      />
                    </CardTooltip>
                  ))}
                </div>
              </div>
            )}

            {sideDeck.length > 0 && (
              <div className="space-y-3">
                <div className="bg-amber-900/30 px-3 py-2 rounded border-l-4 border-amber-500">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-base">
                      Side Deck
                    </span>
                    <span className="text-amber-300 text-sm">
                      ({sideDeck.length})
                    </span>
                  </div>
                </div>
                <div 
                  className="grid gap-1 p-1.5 bg-amber-950/30 rounded border border-amber-500/30"
                  style={{
                    gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                  }}
                >
                  {sideDeck.map((card, index) => (
                    <CardTooltip
                      key={`side-${index}`}
                      cardId={card.id}
                      imageUrl={card.imageUrl}
                      cardName={card.name}
                      disabled={!!draggedCard}
                    >
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        className="w-full h-auto border border-amber-600/30 hover:border-amber-400 transition-colors object-contain cursor-pointer"
                      />
                    </CardTooltip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-8">
      <div className="w-full" style={{ maxWidth: "52%" }}>
        <div className="flex justify-end mb-4">
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Deck</span>
              )}
            </button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="space-y-4 mb-6">
            <label className="block text-sm font-semibold text-blue-400">
              Deck Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setTitle(newTitle);
                if (onDeckChange) {
                  onDeckChange(newTitle, mainDeck, extraDeck, sideDeck);
                }
              }}
              placeholder="Enter a title for your deck"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              maxLength={100}
            />
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-full h-px bg-blue-500/30"></div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="bg-blue-900/30 px-3 py-2 rounded border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-base">
                      Main Deck
                    </span>
                    <span className="text-blue-300 text-sm">
                      ({mainDeck.length}/60)
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddCard("main", e.currentTarget);
                    }}
                    disabled={mainDeck.length >= 60}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded text-xs transition-colors font-semibold disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              <div
                className="grid gap-1 p-1.5 bg-blue-950/30 rounded border border-dashed border-blue-500/40"
                style={{
                  gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                }}
              >
                {mainDeck.map((card, index) => (
                  <div
                    key={`main-${index}`}
                    className="relative group"
                    draggable={true}
                    onDragStart={() => handleDragStart("main", index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop("main", index)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardTooltip
                      cardId={card.id}
                      imageUrl={card.imageUrl}
                      cardName={card.name}
                      disabled={!!draggedCard}
                    >
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        className="w-full h-auto border border-slate-600 group-hover:border-blue-400 transition-colors object-contain cursor-grab active:cursor-grabbing"
                      />
                    </CardTooltip>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCard("main", index);
                      }}
                      className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {mainDeck.length === 0 && (
                  <div 
                    className="col-span-full flex items-center justify-center text-slate-400 text-sm cursor-pointer"
                    onClick={(e) => handleAddCard("main", e.currentTarget)}
                  >
                    Click to add cards to Main Deck
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-purple-900/30 px-3 py-2 rounded border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-base">
                      Extra Deck
                    </span>
                    <span className="text-purple-300 text-sm">
                      ({extraDeck.length}/15)
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddCard("extra", e.currentTarget);
                    }}
                    disabled={extraDeck.length >= 15}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded text-xs transition-colors font-semibold disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              <div
                className="grid gap-1 p-1.5 bg-purple-950/30 rounded border border-dashed border-purple-500/40"
                style={{
                  gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                }}
              >
                {extraDeck.map((card, index) => (
                  <div
                    key={`extra-${index}`}
                    className="relative group"
                    draggable={true}
                    onDragStart={() => handleDragStart("extra", index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop("extra", index)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardTooltip
                      cardId={card.id}
                      imageUrl={card.imageUrl}
                      cardName={card.name}
                      disabled={!!draggedCard}
                    >
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        className="w-full h-auto border border-purple-600/30 group-hover:border-purple-400 transition-colors object-contain cursor-grab active:cursor-grabbing"
                      />
                    </CardTooltip>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCard("extra", index);
                      }}
                      className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {extraDeck.length === 0 && (
                  <div 
                    className="col-span-full flex items-center justify-center text-slate-400 text-sm cursor-pointer"
                    onClick={(e) => handleAddCard("extra", e.currentTarget)}
                  >
                    Click to add cards to Extra Deck
                  </div>
                )}
              </div>
            </div>

            {showSideDeck ? (
              <div className="space-y-3">
                <div className="bg-amber-900/30 px-3 py-2 rounded border-l-4 border-amber-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-base">
                        Side Deck
                      </span>
                      <span className="text-amber-300 text-sm">
                        ({sideDeck.length}/20)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddCard("side", e.currentTarget);
                        }}
                        disabled={sideDeck.length >= 20}
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white rounded text-xs transition-colors font-semibold disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                      <button
                        onClick={handleRemoveSideDeck}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors font-semibold"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove Side Deck</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className="grid gap-1 p-1.5 bg-amber-950/30 rounded border border-dashed border-amber-500/40"
                  style={{
                    gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                  }}
                >
                  {sideDeck.map((card, index) => (
                    <div
                      key={`side-${index}`}
                      className="relative group"
                      draggable={true}
                      onDragStart={() => handleDragStart("side", index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop("side", index)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardTooltip
                        cardId={card.id}
                        imageUrl={card.imageUrl}
                        cardName={card.name}
                        disabled={!!draggedCard}
                      >
                        <img
                          src={card.imageUrlSmall}
                          alt={card.name}
                          className="w-full h-auto border border-amber-600/30 group-hover:border-amber-400 transition-colors object-contain cursor-grab active:cursor-grabbing"
                        />
                      </CardTooltip>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCard("side", index);
                        }}
                        className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {sideDeck.length === 0 && (
                    <div 
                      className="col-span-full flex items-center justify-center text-slate-400 text-sm cursor-pointer"
                      onClick={(e) => handleAddCard("side", e.currentTarget)}
                    >
                      Click to add cards to Side Deck
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleAddSideDeck}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm transition-colors font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Side Deck</span>
                </button>
              </div>
            )}

            {!hasDeck && (
              <div className="text-center text-slate-400 text-sm py-8">
                Add cards to create a recommended deck for this guide
              </div>
            )}
          </div>
        </div>
      </div>

      {isSelectingCard && (
        <FloatingCardSearchModal
          isOpen={true}
          onClose={() => {
            setIsSelectingCard(false);
            setTargetZone(null);
            setAnchorElement(null);
          }}
          onSelectCard={handleCardSelected}
          title={`Add Cards to ${targetZone === "main" ? "Main" : targetZone === "extra" ? "Extra" : "Side"} Deck`}
          anchorElement={anchorElement}
          autoCloseAfterSelect={false}
        />
      )}
    </div>
  );
};