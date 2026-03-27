import { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { CardSearchModal } from "@/features/archetypes/components/CardSearchModal";
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
  onDeckChange?: (title: string, mainDeck: Card[], extraDeck: Card[]) => void;
  onDelete?: () => Promise<void>;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
}

type DeckZone = "main" | "extra" | null;

export const RecommendedDeckEditor = ({
  isEditMode,
  initialTitle = "Recommended Deck",
  initialMainDeck = [],
  initialExtraDeck = [],
  onDeckChange,
  onDelete,
  onModalStateChange,
  forceCloseModal = false,
}: RecommendedDeckEditorProps) => {
  const [title, setTitle] = useState<string>(initialTitle);
  const [mainDeck, setMainDeck] = useState<Card[]>(initialMainDeck);
  const [extraDeck, setExtraDeck] = useState<Card[]>(initialExtraDeck);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [targetZone, setTargetZone] = useState<DeckZone>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const hasDeck = mainDeck.length > 0 || extraDeck.length > 0;

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
    if (!isEditMode || title !== initialTitle) {
      setTitle(initialTitle);
    }
  }, [initialTitle, isEditMode]);

  const getMainDeckColumns = () => {
    if (mainDeck.length > 50) return 12;
    return 10;
  };

  const mainDeckColumns = getMainDeckColumns();
  const cardSize = mainDeckColumns === 12 ? "tiny" : "small";

  const handleAddCard = (zone: DeckZone) => {
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
        onDeckChange(title, newMainDeck, extraDeck);
      }
    } else if (targetZone === "extra") {
      if (extraDeck.length >= 15) {
        alert("Extra deck cannot have more than 15 cards");
        return;
      }
      const newExtraDeck = [...extraDeck, card];
      setExtraDeck(newExtraDeck);
      if (onDeckChange) {
        onDeckChange(title, mainDeck, newExtraDeck);
      }
    }
  };

  const handleRemoveCard = (zone: "main" | "extra", index: number) => {
    if (zone === "main") {
      const newMainDeck = mainDeck.filter((_, i) => i !== index);
      setMainDeck(newMainDeck);
      if (onDeckChange) {
        onDeckChange(title, newMainDeck, extraDeck);
      }
    } else {
      const newExtraDeck = extraDeck.filter((_, i) => i !== index);
      setExtraDeck(newExtraDeck);
      if (onDeckChange) {
        onDeckChange(title, mainDeck, newExtraDeck);
      }
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
      <div className="flex justify-center mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-br from-slate-900/95 via-blue-950/95 to-slate-900/95 rounded-2xl shadow-2xl border-2 border-cyan-500/40 backdrop-blur-xl p-6 w-full max-w-5xl">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
            <div
              className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h4 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {title}
              </h4>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-950/40 to-blue-900/40 px-4 py-3 rounded-lg border-l-4 border-cyan-400 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-base">
                    Main Deck
                  </span>
                  <span className="text-cyan-300 text-sm font-medium">
                    ({mainDeck.length})
                  </span>
                </div>
              </div>
              <div
                className="grid gap-1 p-3 bg-gradient-to-t from-blue-700/20 via-slate-900 to-blue-700/20 rounded-lg min-h-[100px] border border-cyan-500/40"
                style={{
                  gridTemplateColumns: `repeat(${mainDeckColumns}, minmax(0, 1fr))`,
                }}
              >
                {mainDeck.map((card, index) => (
                  <CardTooltip
                    key={`main-${index}`}
                    cardId={card.id}
                    imageUrl={card.imageUrl}
                    cardName={card.name}
                  >
                    <img
                      src={card.imageUrlSmall}
                      alt={card.name}
                      className={`w-full h-auto border border-cyan-600/30 hover:border-cyan-400/50 transition-colors ${
                        cardSize === "tiny" ? "max-h-[60px]" : "max-h-[80px]"
                      } object-contain cursor-pointer`}
                    />
                  </CardTooltip>
                ))}
              </div>
            </div>

            {extraDeck.length > 0 && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-950/40 to-purple-900/40 px-4 py-3 rounded-lg border-l-4 border-purple-400 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base">
                      Extra Deck
                    </span>
                    <span className="text-purple-300 text-sm font-medium">
                      ({extraDeck.length})
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-15 gap-1 p-3 bg-gradient-to-t from-purple-900/30 via-slate-900 to-purple-900/30 rounded-lg border border-blue-400/20">
                  {extraDeck.map((card, index) => (
                    <CardTooltip
                      key={`extra-${index}`}
                      cardId={card.id}
                      imageUrl={card.imageUrl}
                      cardName={card.name}
                    >
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        className="w-full h-auto rounded border border-purple-500/30 hover:border-blue-400/60 transition-colors max-h-[80px] object-contain cursor-pointer"
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
    <div className="flex justify-center mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full max-w-5xl">
        <div className="flex justify-end mb-4">
          {hasDeck && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-all duration-300 font-medium"
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

        <div className="relative bg-gradient-to-br from-slate-900/95 via-blue-950/95 to-slate-900/95 rounded-2xl shadow-2xl border-2 border-cyan-500/40 backdrop-blur-xl p-6">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
            <div
              className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          <div className="space-y-4 mb-6">
            <label className="block text-sm font-bold text-cyan-300">
              Deck Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setTitle(newTitle);
                if (onDeckChange) {
                  onDeckChange(newTitle, mainDeck, extraDeck);
                }
              }}
              placeholder="Enter a title for your deck"
              className="w-full px-4 py-3 bg-gradient-to-r from-slate-800/80 via-slate-900/80 to-slate-800/80 border-2 border-cyan-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 backdrop-blur-sm font-medium"
              maxLength={100}
            />
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-950/40 to-blue-900/40 px-4 py-3 rounded-lg border-l-4 border-cyan-400 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base">
                      Main Deck
                    </span>
                    <span className="text-cyan-300 text-sm font-medium">
                      ({mainDeck.length}/60)
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddCard("main")}
                    disabled={mainDeck.length >= 60}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg text-xs transition-all duration-300 font-bold disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              <div
                className="grid gap-1 p-3 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/60 rounded-lg min-h-[200px] border-2 border-dashed border-cyan-400/40 cursor-pointer hover:border-cyan-400/60 transition-colors"
                style={{
                  gridTemplateColumns: `repeat(${mainDeckColumns}, minmax(0, 1fr))`,
                }}
                onClick={() => mainDeck.length < 60 && handleAddCard("main")}
              >
                {mainDeck.map((card, index) => (
                  <div
                    key={`main-${index}`}
                    className="relative group animate-in fade-in duration-300"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <CardTooltip
                      cardId={card.id}
                      imageUrl={card.imageUrl}
                      cardName={card.name}
                    >
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        className={`w-full h-auto rounded border-2 border-slate-600 group-hover:border-cyan-400/80 transition-colors ${
                          cardSize === "tiny" ? "max-h-[60px]" : "max-h-[80px]"
                        } object-contain cursor-pointer`}
                      />
                    </CardTooltip>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCard("main", index);
                      }}
                      className="absolute top-0 right-0 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {mainDeck.length === 0 && (
                  <div className="col-span-full flex items-center justify-center text-slate-400 text-sm font-medium">
                    Click to add cards to Main Deck
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-950/40 to-purple-900/40 px-4 py-3 rounded-lg border-l-4 border-blue-400 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base">
                      Extra Deck
                    </span>
                    <span className="text-cyan-300 text-sm font-medium">
                      ({extraDeck.length}/15)
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddCard("extra")}
                    disabled={extraDeck.length >= 15}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg text-xs transition-all duration-300 font-bold disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              <div
                className="grid grid-cols-15 gap-1 p-3 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 rounded-lg min-h-[100px] border-2 border-dashed border-blue-400/40 cursor-pointer hover:border-blue-400/60 transition-colors"
                onClick={() => extraDeck.length < 15 && handleAddCard("extra")}
              >
                {extraDeck.map((card, index) => (
                  <div
                    key={`extra-${index}`}
                    className="relative group animate-in fade-in duration-300"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <CardTooltip
                      cardId={card.id}
                      imageUrl={card.imageUrl}
                      cardName={card.name}
                    >
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        className="w-full h-auto rounded border-2 border-slate-600 group-hover:border-blue-400/80 transition-colors max-h-[80px] object-contain cursor-pointer"
                      />
                    </CardTooltip>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCard("extra", index);
                      }}
                      className="absolute top-0 right-0 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {extraDeck.length === 0 && (
                  <div className="col-span-full flex items-center justify-center text-slate-400 text-sm font-medium">
                    Click to add cards to Extra Deck
                  </div>
                )}
              </div>
            </div>

            {!hasDeck && (
              <div className="text-center text-slate-400 text-sm py-8 font-medium">
                Add cards to create a recommended deck for this guide
              </div>
            )}
          </div>
        </div>
      </div>

      {isSelectingCard && (
        <CardSearchModal
          isOpen={true}
          onClose={() => {
            setIsSelectingCard(false);
            setTargetZone(null);
          }}
          onSelectCard={handleCardSelected}
          title={`Add Cards to ${targetZone === "main" ? "Main" : "Extra"} Deck`}
          variant="sidebar"
          autoCloseAfterSelect={false}
          sidebarVerticalAlign={targetZone === "main" ? "main-deck" : "extra-deck"}
        />
      )}
    </div>
  );
};