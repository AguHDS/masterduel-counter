import { useState, useRef } from "react";
import { Plus, X, Loader2, Save } from "lucide-react";
import { FloatingCardSearchModal } from "@/features/guide-editor/components/FloatingCardSearchModal";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";

interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

interface DeckCard extends Card {
  uniqueId: string;
}

interface CustomDeckEditorProps {
  onSave: (title: string, mainDeck: Card[], extraDeck: Card[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}

type DeckZone = "main" | "extra" | null;

export const CustomDeckEditor = ({
  onSave,
  onCancel,
  isSaving,
}: CustomDeckEditorProps) => {
  const [title, setTitle] = useState<string>("Custom Deck");
  const [mainDeck, setMainDeck] = useState<DeckCard[]>([]);
  const [extraDeck, setExtraDeck] = useState<DeckCard[]>([]);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const uniqueIdCounter = useRef(0);
  const [targetZone, setTargetZone] = useState<DeckZone>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [draggedCard, setDraggedCard] = useState<{ zone: "main" | "extra"; index: number } | null>(null);

  const hasDeck = mainDeck.length > 0 || extraDeck.length > 0;

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
      const deckCard: DeckCard = { ...card, uniqueId: `card-${uniqueIdCounter.current++}` };
      const newMainDeck = [...mainDeck, deckCard];
      setMainDeck(newMainDeck);
    } else if (targetZone === "extra") {
      if (extraDeck.length >= 15) {
        alert("Extra deck cannot have more than 15 cards");
        return;
      }
      const deckCard: DeckCard = { ...card, uniqueId: `card-${uniqueIdCounter.current++}` };
      const newExtraDeck = [...extraDeck, deckCard];
      setExtraDeck(newExtraDeck);
    }
  };

  const handleRemoveCard = (zone: "main" | "extra", index: number) => {
    if (zone === "main") {
      const newMainDeck = mainDeck.filter((_, i) => i !== index);
      setMainDeck(newMainDeck);
    } else {
      const newExtraDeck = extraDeck.filter((_, i) => i !== index);
      setExtraDeck(newExtraDeck);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (zone: "main" | "extra", index: number) => {
    setDraggedCard({ zone, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (zone: "main" | "extra", dropIndex: number) => {
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
    } else {
      const newExtraDeck = [...extraDeck];
      // Swap the cards
      const temp = newExtraDeck[draggedCard.index];
      newExtraDeck[draggedCard.index] = newExtraDeck[dropIndex];
      newExtraDeck[dropIndex] = temp;
      
      setExtraDeck(newExtraDeck);
    }

    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleSave = () => {
    if (!hasDeck) {
      alert("Please add at least one card to save the deck");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a title for the deck");
      return;
    }
    
    // Remove uniqueId before saving
    const mainDeckToSave = mainDeck.map(({ uniqueId, ...card }) => card);
    const extraDeckToSave = extraDeck.map(({ uniqueId, ...card }) => card);
    
    onSave(title.trim(), mainDeckToSave, extraDeckToSave);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            onChange={(e) => setTitle(e.target.value)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddCard("main", e.currentTarget);
                  }}
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
                gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
              }}
              onClick={(e) => mainDeck.length < 60 && handleAddCard("main", e.currentTarget)}
            >
              {mainDeck.map((card, index) => (
                <div
                  key={card.uniqueId}
                  className="relative group animate-in fade-in duration-300"
                  style={{ animationDelay: `${index * 30}ms` }}
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
                      className="w-full h-auto rounded border-2 border-slate-600 group-hover:border-cyan-400/80 transition-colors object-contain cursor-grab active:cursor-grabbing"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddCard("extra", e.currentTarget);
                  }}
                  disabled={extraDeck.length >= 15}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg text-xs transition-all duration-300 font-bold disabled:cursor-not-allowed"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
            <div
              className="grid gap-1 p-3 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 rounded-lg min-h-[100px] border-2 border-dashed border-blue-400/40 cursor-pointer hover:border-blue-400/60 transition-colors"
              style={{
                gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
              }}
              onClick={(e) => extraDeck.length < 15 && handleAddCard("extra", e.currentTarget)}
            >
              {extraDeck.map((card, index) => (
                <div
                  key={card.uniqueId}
                  className="relative group animate-in fade-in duration-300"
                  style={{ animationDelay: `${index * 30}ms` }}
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
                      className="w-full h-auto rounded border-2 border-slate-600 group-hover:border-blue-400/80 transition-colors max-h-[80px] object-contain cursor-grab active:cursor-grabbing"
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
                <div className="col-span-full flex items-center justify-center text-slate-400 text-sm font-medium">
                  Click to add cards to Extra Deck
                </div>
              )}
            </div>
          </div>

          {!hasDeck && (
            <div className="text-center text-slate-400 text-sm py-8 font-medium">
              Add cards to create your custom deck
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasDeck}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 font-medium"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Deck</span>
              </>
            )}
          </button>
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
          title={`Add Cards to ${targetZone === "main" ? "Main" : "Extra"} Deck`}
          anchorElement={anchorElement}
          autoCloseAfterSelect={false}
        />
      )}
    </div>
  );
};
