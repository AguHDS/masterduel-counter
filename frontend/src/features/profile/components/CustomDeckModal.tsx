import { useState, useRef, useEffect } from "react";
import { X, Trash2, Lock, Globe, Edit2, Plus, Save } from "lucide-react";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import { FloatingCardSearchModal } from "@/features/guide-editor/components/FloatingCardSearchModal";
import type { CustomDeck } from "../api/customDeckApi";

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

type DeckZone = "main" | "extra" | null;

interface CustomDeckModalProps {
  deck: CustomDeck;
  isOwner: boolean;
  onClose: () => void;
  onUpdate: (deckId: number, updates: { title?: string; mainDeckCards?: number[]; extraDeckCards?: number[]; isPublic?: boolean }) => void;
  onDelete: (deckId: number, deckTitle: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const CustomDeckModal = ({ 
  deck, 
  isOwner, 
  onClose, 
  onUpdate, 
  onDelete, 
  isUpdating,
  isDeleting 
}: CustomDeckModalProps) => {
  const uniqueIdCounter = useRef(0);
  
  // Initialize decks with uniqueIds
  const initializeDeck = (cards: Card[]): DeckCard[] => {
    return cards.map(card => ({ ...card, uniqueId: `card-${uniqueIdCounter.current++}` }));
  };
  
  const [mainDeck, setMainDeck] = useState<DeckCard[]>(initializeDeck(deck.mainDeck));
  const [extraDeck, setExtraDeck] = useState<DeckCard[]>(initializeDeck(deck.extraDeck));
  const [isPublic, setIsPublic] = useState(deck.isPublic);
  const [title, setTitle] = useState(deck.title);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [targetZone, setTargetZone] = useState<DeckZone>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [draggedCard, setDraggedCard] = useState<{ zone: "main" | "extra"; index: number } | null>(null);
  
  // Reset decks when deck prop changes
  useEffect(() => {
    setMainDeck(initializeDeck(deck.mainDeck));
    setExtraDeck(initializeDeck(deck.extraDeck));
    setTitle(deck.title);
    setIsPublic(deck.isPublic);
    setHasChanges(false);
    setIsEditMode(false);
  }, [deck.id]);

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
      setMainDeck([...mainDeck, deckCard]);
      setHasChanges(true);
    } else if (targetZone === "extra") {
      if (extraDeck.length >= 15) {
        alert("Extra deck cannot have more than 15 cards");
        return;
      }
      const deckCard: DeckCard = { ...card, uniqueId: `card-${uniqueIdCounter.current++}` };
      setExtraDeck([...extraDeck, deckCard]);
      setHasChanges(true);
    }
  };

  const handleRemoveCard = (zone: "main" | "extra", index: number) => {
    if (!isOwner || !isEditMode) return;

    if (zone === "main") {
      const newMainDeck = mainDeck.filter((_, i) => i !== index);
      setMainDeck(newMainDeck);
      setHasChanges(true);
    } else {
      const newExtraDeck = extraDeck.filter((_, i) => i !== index);
      setExtraDeck(newExtraDeck);
      setHasChanges(true);
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
      setHasChanges(true);
    } else {
      const newExtraDeck = [...extraDeck];
      // Swap the cards
      const temp = newExtraDeck[draggedCard.index];
      newExtraDeck[draggedCard.index] = newExtraDeck[dropIndex];
      newExtraDeck[dropIndex] = temp;
      
      setExtraDeck(newExtraDeck);
      setHasChanges(true);
    }

    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleTogglePublic = () => {
    if (!isOwner) return;
    const newIsPublic = !isPublic;
    setIsPublic(newIsPublic);
    // Actualizar inmediatamente el estado público
    onUpdate(deck.id, { isPublic: newIsPublic });
  };

  const handleSaveChanges = () => {
    if (!hasChanges) return;
    
    if (!title.trim()) {
      alert("Please enter a title for the deck");
      return;
    }
    
    const mainDeckCards = mainDeck.map(card => card.id);
    const extraDeckCards = extraDeck.map(card => card.id);
    
    onUpdate(deck.id, { title: title.trim(), mainDeckCards, extraDeckCards });
    setHasChanges(false);
    setIsEditMode(false);
  };

  const handleClose = () => {
    if (hasChanges && isEditMode) {
      const confirmed = confirm("Close without saving?");
      if (!confirmed) return;
    }
    onClose();
  };

  const handleDelete = () => {
    onDelete(deck.id, deck.title);
    onClose();
  };

  // Validar si el deck puede ser visto
  const canView = isOwner || isPublic;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-gradient-to-br from-slate-900/95 via-blue-950/95 to-slate-900/95 rounded-2xl shadow-2xl border-2 border-cyan-500/40 backdrop-blur-xl max-w-4xl w-full max-h-[90vh] overflow-auto scrollbar-cardpair"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/30 px-6 py-4 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isOwner && isEditMode ? (
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasChanges(true);
                }}
                className="text-xl font-bold bg-slate-800/50 border-2 border-cyan-500/30 focus:border-cyan-400/60 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                maxLength={100}
              />
            ) : (
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent truncate">
                {title}
              </h2>
            )}
            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePublic}
                  disabled={isUpdating}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isPublic
                      ? "bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30"
                      : "bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700/70"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isPublic ? "Public" : "Private"}</span>
                </button>
              </div>
            )}
            {!isOwner && !isPublic && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 text-slate-400 border border-slate-600/30 rounded-lg text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Private</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isOwner && !isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors font-medium flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
            {isOwner && isEditMode && (
              <button
                onClick={() => {
                  setIsEditMode(false);
                  if (hasChanges) {
                    setMainDeck(initializeDeck(deck.mainDeck));
                    setExtraDeck(initializeDeck(deck.extraDeck));
                    setTitle(deck.title);
                    setHasChanges(false);
                  }
                }}
                disabled={isUpdating}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors font-medium"
              >
                Cancel Edit
              </button>
            )}
            {isOwner && hasChanges && (
              <button
                onClick={handleSaveChanges}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={isDeleting || isUpdating}
                className="p-2 bg-red-600/20 hover:bg-red-600/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
        </div>

        {!canView ? (
          <div className="p-20 text-center">
            <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">This deck is private</p>
            <p className="text-slate-500 text-sm mt-2">Only the owner can view this deck</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Main Deck */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-950/40 to-blue-900/40 px-4 py-3 rounded-lg border-l-4 border-cyan-400 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base">
                      Main Deck
                    </span>
                    <span className="text-cyan-300 text-sm font-medium">
                      ({mainDeck.length})
                    </span>
                  </div>
                  {isOwner && isEditMode && (
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
                  )}
                </div>
              </div>
              <div
                className="grid gap-1 p-3 bg-gradient-to-t from-blue-700/20 via-slate-900 to-blue-700/20 rounded-lg min-h-[100px] border border-cyan-500/40"
                style={{
                  gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                }}
              >
                {mainDeck.map((card, index) => (
                  <div
                    key={card.uniqueId}
                    className="relative group"
                    draggable={isOwner && isEditMode}
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
                        className="w-full h-auto border border-cyan-600/30 hover:border-cyan-400/50 transition-colors object-contain cursor-grab active:cursor-grabbing"
                      />
                    </CardTooltip>
                    {isOwner && isEditMode && (
                      <button
                        onClick={() => handleRemoveCard("main", index)}
                        className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Extra Deck */}
            {(extraDeck.length > 0 || (isOwner && isEditMode)) && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-950/40 to-purple-900/40 px-4 py-3 rounded-lg border-l-4 border-purple-400 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-base">
                        Extra Deck
                      </span>
                      <span className="text-purple-300 text-sm font-medium">
                        ({extraDeck.length})
                      </span>
                    </div>
                    {isOwner && isEditMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddCard("extra", e.currentTarget);
                        }}
                        disabled={extraDeck.length >= 15}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg text-xs transition-all duration-300 font-bold disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
                <div 
                  className="grid gap-1 p-3 bg-gradient-to-t from-purple-900/30 via-slate-900 to-purple-900/30 rounded-lg border border-blue-400/20 min-h-[100px]"
                  style={{
                    gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                  }}
                >
                  {extraDeck.map((card, index) => (
                    <div
                      key={card.uniqueId}
                      className="relative group"
                      draggable={isOwner && isEditMode}
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
                          className={`w-full h-auto rounded border border-purple-500/30 hover:border-blue-400/60 transition-colors max-h-[80px] object-contain ${isOwner && isEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                        />
                      </CardTooltip>
                      {isOwner && isEditMode && (
                        <button
                          onClick={() => handleRemoveCard("extra", index)}
                          className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Search Modal */}
      {isSelectingCard && (
        <FloatingCardSearchModal
          isOpen={true}
          title={`Add Card to ${targetZone === "main" ? "Main" : "Extra"} Deck`}
          onSelectCard={handleCardSelected}
          onClose={() => {
            setIsSelectingCard(false);
            setTargetZone(null);
            setAnchorElement(null);
          }}
          anchorElement={anchorElement}
          autoCloseAfterSelect={false}
        />
      )}
    </div>
  );
};
