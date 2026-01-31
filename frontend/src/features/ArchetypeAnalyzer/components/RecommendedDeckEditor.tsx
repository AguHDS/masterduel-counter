import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { DeckBuilderCardSearch } from "./DeckBuilderCardSearch";
import { CardTooltip } from "./CardTooltip";

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
}

type DeckZone = "main" | "extra" | null;

export const RecommendedDeckEditor = ({
  isEditMode,
  initialTitle = "Recommended Deck",
  initialMainDeck = [],
  initialExtraDeck = [],
  onDeckChange,
  onDelete,
}: RecommendedDeckEditorProps) => {
  const [title, setTitle] = useState<string>(initialTitle);
  const [mainDeck, setMainDeck] = useState<Card[]>(initialMainDeck);
  const [extraDeck, setExtraDeck] = useState<Card[]>(initialExtraDeck);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [targetZone, setTargetZone] = useState<DeckZone>(null);

  const hasDeck = mainDeck.length > 0 || extraDeck.length > 0;

  // Sync state with initial props when they change (after loading)
  // Only update if the content actually changed to avoid infinite loops
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (JSON.stringify(mainDeck) !== JSON.stringify(initialMainDeck)) {
      setMainDeck(initialMainDeck);
    }
  }, [initialMainDeck]);

  useEffect(() => {
    if (JSON.stringify(extraDeck) !== JSON.stringify(initialExtraDeck)) {
      setExtraDeck(initialExtraDeck);
    }
  }, [initialExtraDeck]);

  // Calculate grid columns based on main deck size
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
    // Don't close the modal - user can add multiple cards
    // Modal will close when user clicks the X button
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
    
    const confirmed = confirm("Are you sure you want to delete the recommended deck?");
    if (!confirmed) return;

    try {
      await onDelete();
      setMainDeck([]);
      setExtraDeck([]);
      setTitle("Recommended Deck");
    } catch (error) {
      console.error("Error deleting deck:", error);
      alert("Failed to delete deck. Please try again.");
    }
  };

  // Render read-only mode
  if (!isEditMode && !hasDeck) {
    return null; // Don't show anything if no deck and not editing
  }

  if (!isEditMode && hasDeck) {
    return (
      <div className="mt-8">
        <div className="flex justify-center my-8">
          <div className="w-4/5 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-blue-300">Recommended Deck</h3>

          {/* Deck Title */}
          {title && (
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white">{title}</h4>
            </div>
          )}

          {/* Main Deck */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Main Deck</span>
              <span className="text-blue-300 text-sm">({mainDeck.length})</span>
            </div>
            <div
              className="grid gap-1 p-3 bg-slate-900/60 rounded-lg min-h-[100px]"
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
                    className={`w-full h-auto rounded border border-slate-600 ${
                      cardSize === "tiny" ? "max-h-[60px]" : "max-h-[80px]"
                    } object-contain cursor-pointer`}
                  />
                </CardTooltip>
              ))}
            </div>
          </div>

          {/* Extra Deck */}
          {extraDeck.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">Extra Deck</span>
                <span className="text-blue-300 text-sm">({extraDeck.length})</span>
              </div>
              <div className="grid grid-cols-15 gap-1 p-3 bg-slate-800/30 rounded-lg">
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
                      className="w-full h-auto rounded border border-slate-600 max-h-[80px] object-contain cursor-pointer"
                    />
                  </CardTooltip>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render edit mode
  return (
    <div className="mt-8">
      <div className="flex justify-center my-8">
        <div className="w-4/5 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-blue-300">Recommended Deck</h3>
          <div className="flex items-center gap-2">
            {hasDeck && onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Deck</span>
              </button>
            )}
          </div>
        </div>

        {/* Deck Title Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Deck Title</label>
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
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>

        {/* Main Deck */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Main Deck</span>
              <span className="text-blue-300 text-sm">({mainDeck.length}/60)</span>
            </div>
            <button
              onClick={() => handleAddCard("main")}
              disabled={mainDeck.length >= 60}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Card</span>
            </button>
          </div>
          <div
            className="grid gap-1 p-3 bg-slate-900/60 rounded-lg min-h-[200px] border-2 border-dashed border-slate-600 cursor-pointer hover:border-blue-500 transition-colors"
            style={{
              gridTemplateColumns: `repeat(${mainDeckColumns}, minmax(0, 1fr))`,
            }}
            onClick={() => mainDeck.length < 60 && handleAddCard("main")}
          >
            {mainDeck.map((card, index) => (
              <div key={`main-${index}`} className="relative group">
                <CardTooltip
                  cardId={card.id}
                  imageUrl={card.imageUrl}
                  cardName={card.name}
                >
                  <img
                    src={card.imageUrlSmall}
                    alt={card.name}
                    className={`w-full h-auto rounded border border-slate-600 ${
                      cardSize === "tiny" ? "max-h-[60px]" : "max-h-[80px]"
                    } object-contain cursor-pointer`}
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
              <div className="col-span-full flex items-center justify-center text-slate-400 text-sm">
                Click to add cards to Main Deck
              </div>
            )}
          </div>
        </div>

        {/* Extra Deck */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Extra Deck</span>
              <span className="text-blue-300 text-sm">({extraDeck.length}/15)</span>
            </div>
            <button
              onClick={() => handleAddCard("extra")}
              disabled={extraDeck.length >= 15}
              className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Card</span>
            </button>
          </div>
          <div
            className="grid grid-cols-15 gap-1 p-3 bg-slate-800/30 rounded-lg min-h-[100px] border-2 border-dashed border-slate-600 cursor-pointer hover:border-purple-500 transition-colors"
            onClick={() => extraDeck.length < 15 && handleAddCard("extra")}
          >
            {extraDeck.map((card, index) => (
              <div key={`extra-${index}`} className="relative group">
                <CardTooltip
                  cardId={card.id}
                  imageUrl={card.imageUrl}
                  cardName={card.name}
                >
                  <img
                    src={card.imageUrlSmall}
                    alt={card.name}
                    className="w-full h-auto rounded border border-slate-600 max-h-[80px] object-contain cursor-pointer"
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
              <div className="col-span-full flex items-center justify-center text-slate-400 text-sm">
                Click to add cards to Extra Deck
              </div>
            )}
          </div>
        </div>

        {!hasDeck && (
          <div className="text-center text-slate-400 text-sm py-4">
            Add cards to create a recommended deck for this guide
          </div>
        )}
      </div>

      {isSelectingCard && (
        <DeckBuilderCardSearch
          isOpen={true}
          onClose={() => {
            setIsSelectingCard(false);
            setTargetZone(null);
          }}
          onSelectCard={handleCardSelected}
          title={`Add Cards to ${targetZone === "main" ? "Main" : "Extra"} Deck`}
        />
      )}
    </div>
  );
};
