import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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

type DeckZone = "main" | "extra" | "side" | "header" | null;

interface CustomDeckModalProps {
  deck?: CustomDeck; // Optional for creation mode
  isOwner: boolean;
  onClose: () => void;
  onSave?: (data: { title: string; mainDeckCards: number[]; extraDeckCards: number[]; sideDeckCards: number[]; headerCardId?: number; isPublic: boolean }) => void; // For creation
  onUpdate?: (deckId: number, updates: { title?: string; mainDeckCards?: number[]; extraDeckCards?: number[]; sideDeckCards?: number[]; headerCardId?: number; isPublic?: boolean }) => void; // For editing
  onDelete?: (deckId: number, deckTitle: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export const CustomDeckModal = ({ 
  deck, 
  isOwner, 
  onClose, 
  onSave,
  onUpdate, 
  onDelete, 
  isUpdating = false,
  isDeleting = false
}: CustomDeckModalProps) => {
  const uniqueIdCounter = useRef(0);
  const isCreationMode = !deck;
  
  // Initialize decks with uniqueIds (memoized for performance)
  const initializeDeck = useCallback((cards: Card[]): DeckCard[] => {
    return cards.map(card => ({ ...card, uniqueId: `card-${uniqueIdCounter.current++}` }));
  }, []);
  
  const [mainDeck, setMainDeck] = useState<DeckCard[]>(() => initializeDeck(deck?.mainDeck || []));
  const [extraDeck, setExtraDeck] = useState<DeckCard[]>(() => initializeDeck(deck?.extraDeck || []));
  const [sideDeck, setSideDeck] = useState<DeckCard[]>(() => initializeDeck(deck?.sideDeck || []));
  const [showSideDeck, setShowSideDeck] = useState<boolean>((deck?.sideDeck?.length || 0) > 0);
  const [isPublic, setIsPublic] = useState(deck?.isPublic ?? true);
  const [title, setTitle] = useState(deck?.title || "Custom Deck");
  const [headerCard, setHeaderCard] = useState<Card | null>(null);
  const [hasChanges, setHasChanges] = useState(isCreationMode);
  const [isEditMode, setIsEditMode] = useState(isCreationMode);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [targetZone, setTargetZone] = useState<DeckZone>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [draggedCard, setDraggedCard] = useState<{ zone: "main" | "extra" | "side"; index: number } | null>(null);
  
  // Reset decks when deck prop changes (only in edit mode)
  useEffect(() => {
    if (deck) {
      setMainDeck(initializeDeck(deck.mainDeck));
      setExtraDeck(initializeDeck(deck.extraDeck));
      setSideDeck(initializeDeck(deck.sideDeck || []));
      setShowSideDeck((deck.sideDeck?.length || 0) > 0);
      setTitle(deck.title);
      setIsPublic(deck.isPublic);
      
      // Set header card directly from deck.headerCard
      if (deck.headerCard) {
        setHeaderCard(deck.headerCard);
      } else {
        setHeaderCard(null);
      }
      
      setHasChanges(false);
      setIsEditMode(false);
    }
  }, [deck?.id, deck?.mainDeck, deck?.extraDeck, deck?.sideDeck, deck?.title, deck?.isPublic, deck?.headerCard, initializeDeck, deck]);

  const handleAddCard = useCallback((zone: DeckZone, anchor: HTMLElement) => {
    setAnchorElement(anchor);
    setTargetZone(zone);
    setIsSelectingCard(true);
  }, []);

  const handleCardSelected = useCallback((card: Card) => {
    if (targetZone === "header") {
      setHeaderCard(card);
      setHasChanges(true);
      setIsSelectingCard(false);
      setTargetZone(null);
      setAnchorElement(null);
      return;
    }
    
    const deckCard: DeckCard = { ...card, uniqueId: `card-${uniqueIdCounter.current++}` };
    
    if (targetZone === "main") {
      if (mainDeck.length >= 60) {
        alert("Main deck cannot have more than 60 cards");
        return;
      }
      setMainDeck(prev => [...prev, deckCard]);
      setHasChanges(true);
    } else if (targetZone === "extra") {
      if (extraDeck.length >= 15) {
        alert("Extra deck cannot have more than 15 cards");
        return;
      }
      setExtraDeck(prev => [...prev, deckCard]);
      setHasChanges(true);
    } else if (targetZone === "side") {
      if (sideDeck.length >= 20) {
        alert("Side deck cannot have more than 20 cards");
        return;
      }
      setSideDeck(prev => [...prev, deckCard]);
      setHasChanges(true);
    }
  }, [targetZone, mainDeck.length, extraDeck.length, sideDeck.length]);

  const handleRemoveCard = useCallback((zone: "main" | "extra" | "side", index: number) => {
    if (!isOwner || !isEditMode) return;

    let removedCard: DeckCard | undefined;

    if (zone === "main") {
      setMainDeck(prev => {
        removedCard = prev[index];
        return prev.filter((_, i) => i !== index);
      });
      setHasChanges(true);
    } else if (zone === "extra") {
      setExtraDeck(prev => {
        removedCard = prev[index];
        return prev.filter((_, i) => i !== index);
      });
      setHasChanges(true);
    } else if (zone === "side") {
      setSideDeck(prev => {
        removedCard = prev[index];
        return prev.filter((_, i) => i !== index);
      });
      setHasChanges(true);
    }

    // Clear header card if the removed card was the header card
    if (removedCard && headerCard && removedCard.id === headerCard.id) {
      setHeaderCard(null);
    }
  }, [isOwner, isEditMode, headerCard]);

  // Drag and drop handlers (memoized for performance)
  const handleDragStart = useCallback((zone: "main" | "extra" | "side", index: number) => {
    setDraggedCard({ zone, index });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((zone: "main" | "extra" | "side", dropIndex: number) => {
    if (!draggedCard || draggedCard.zone !== zone || draggedCard.index === dropIndex) {
      setDraggedCard(null);
      return;
    }

    const updateDeck = (deck: DeckCard[]) => {
      const newDeck = [...deck];
      const temp = newDeck[draggedCard.index];
      newDeck[draggedCard.index] = newDeck[dropIndex];
      newDeck[dropIndex] = temp;
      return newDeck;
    };

    if (zone === "main") {
      setMainDeck(updateDeck);
      setHasChanges(true);
    } else if (zone === "extra") {
      setExtraDeck(updateDeck);
      setHasChanges(true);
    } else if (zone === "side") {
      setSideDeck(updateDeck);
      setHasChanges(true);
    }

    setDraggedCard(null);
  }, [draggedCard]);

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
  }, []);

  const handleTogglePublic = useCallback(() => {
    if (!isOwner) return;
    const newIsPublic = !isPublic;
    setIsPublic(newIsPublic);
    if (!isCreationMode && deck && onUpdate) {
      onUpdate(deck.id, { isPublic: newIsPublic });
    } else {
      setHasChanges(true);
    }
  }, [isOwner, isPublic, deck, onUpdate, isCreationMode]);

  const handleSaveChanges = useCallback(() => {
    if (!hasChanges || !title.trim()) {
      if (!title.trim()) {
        alert("Please enter a title for the deck");
      }
      return;
    }
    
    const mainDeckCards = mainDeck.map(card => card.id);
    const extraDeckCards = extraDeck.map(card => card.id);
    const sideDeckCards = sideDeck.map(card => card.id);
    const headerCardId = headerCard?.id;
    
    if (isCreationMode && onSave) {
      onSave({ title: title.trim(), mainDeckCards, extraDeckCards, sideDeckCards, headerCardId, isPublic });
    } else if (!isCreationMode && deck && onUpdate) {
      onUpdate(deck.id, { title: title.trim(), mainDeckCards, extraDeckCards, sideDeckCards, headerCardId });
      setHasChanges(false);
      setIsEditMode(false);
    }
  }, [hasChanges, title, mainDeck, extraDeck, sideDeck, headerCard, isPublic, deck, onUpdate, onSave, isCreationMode]);

  const handleClose = useCallback(() => {
    if (hasChanges && isEditMode) {
      const confirmed = confirm("Close without saving?");
      if (!confirmed) return;
    }
    onClose();
  }, [hasChanges, isEditMode, onClose]);

  const handleDelete = useCallback(() => {
    if (!deck || !onDelete) return;
    onDelete(deck.id, deck.title);
    onClose();
  }, [deck, onDelete, onClose]);

  const handleAddSideDeck = useCallback(() => {
    setShowSideDeck(true);
    setHasChanges(true);
  }, []);

  const handleRemoveSideDeck = useCallback(() => {
    if (sideDeck.length > 0) {
      const confirmed = confirm("Remove all cards from side deck?");
      if (!confirmed) return;
    }
    setSideDeck([]);
    setShowSideDeck(false);
    setHasChanges(true);
  }, [sideDeck.length]);

  // Validar si el deck puede ser visto
  const canView = useMemo(() => isOwner || isPublic, [isOwner, isPublic]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[400] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-slate-900 rounded-lg shadow-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-auto scrollbar-cardpair"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-3 py-2 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isOwner && isEditMode ? (
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasChanges(true);
                }}
                className="text-sm font-bold bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                maxLength={100}
              />
            ) : (
              <h2 className="text-sm font-bold text-white truncate">
                {title}
              </h2>
            )}
            {isOwner && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTogglePublic}
                  disabled={isUpdating}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    isPublic
                      ? "bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30"
                      : "bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700/70"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{isPublic ? "Public" : "Private"}</span>
                </button>
              </div>
            )}
            {!isOwner && !isPublic && (
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-400 border border-slate-600/30 rounded text-xs font-medium">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isOwner && !isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                disabled={isUpdating}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors font-medium flex items-center gap-1.5"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
            {isOwner && isEditMode && (
              <button
                onClick={() => {
                  setIsEditMode(false);
                  if (hasChanges && deck) {
                    setMainDeck(initializeDeck(deck.mainDeck));
                    setExtraDeck(initializeDeck(deck.extraDeck));
                    setSideDeck(initializeDeck(deck.sideDeck || []));
                    setShowSideDeck((deck.sideDeck?.length || 0) > 0);
                    setTitle(deck.title);
                    setHasChanges(false);
                  }
                }}
                disabled={isUpdating}
                className="px-2.5 py-1 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors font-medium"
              >
                Cancel Edit
              </button>
            )}
            {isOwner && hasChanges && (
              <button
                onClick={handleSaveChanges}
                disabled={isUpdating}
                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors font-medium flex items-center gap-1.5"
              >
                <Save className="w-3 h-3" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={isDeleting || isUpdating}
                className="p-1.5 bg-red-600/20 hover:bg-red-600/40 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-slate-800/50 rounded transition-colors"
            >
              <X className="w-4 h-4 text-cyan-400" />
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
          <div className="p-2.5 space-y-3">
            {/* Header Card Selection */}
            {isOwner && isEditMode && (
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {headerCard ? (
                      <div className="relative group">
                        <img
                          src={headerCard.imageUrlCropped}
                          alt={headerCard.name}
                          className="h-[60px] w-[60px] object-cover rounded border-2 border-cyan-500"
                        />
                        <button
                          onClick={() => setHeaderCard(null)}
                          className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-[60px] w-[60px] bg-slate-700 rounded border-2 border-dashed border-slate-600 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-1.5">Header Card (Preview)</p>
                    <button
                      onClick={(e) => handleAddCard("header", e.currentTarget)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs transition-colors font-semibold"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{headerCard ? "Change Header Card" : "Select Header Card"}</span>
                    </button>
                    {headerCard && (
                      <p className="text-xs text-slate-300 mt-1.5 truncate">{headerCard.name}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Main Deck Container */}
            <div className="space-y-2">
              {/* Main Deck */}
              <div className="space-y-2">
                <div className="bg-blue-900/30 px-2 py-1.5 rounded border-l-4 border-blue-500">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-semibold text-sm">Main Deck</span>
                      <span className="text-blue-300 text-xs">({mainDeck.length})</span>
                    </div>
                    {isOwner && isEditMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddCard("main", e.currentTarget);
                        }}
                        disabled={mainDeck.length >= 60}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded text-xs transition-colors font-semibold disabled:cursor-not-allowed"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className="grid gap-0.5 p-1 bg-blue-950/30 rounded border border-dashed border-blue-500/40"
                  style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
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
                    <CardTooltip cardId={card.id} imageUrl={card.imageUrl} cardName={card.name} disabled={!!draggedCard}>
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        className="w-full h-auto border border-slate-600 hover:border-blue-400 transition-colors object-contain cursor-grab active:cursor-grabbing"
                      />
                    </CardTooltip>
                    {isOwner && isEditMode && (
                      <button
                        onClick={() => handleRemoveCard("main", index)}
                        className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    )}
                  </div>
                ))}
                </div>
              </div>

              {/* Extra Deck */}
              {(extraDeck.length > 0 || (isOwner && isEditMode)) && (
                <div className="space-y-2">
                  <div className="bg-purple-900/30 px-3 py-2 rounded border-l-4 border-purple-500">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-base">Extra Deck</span>
                        <span className="text-purple-300 text-sm">({extraDeck.length})</span>
                      </div>
                      {isOwner && isEditMode && (
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
                      )}
                    </div>
                  </div>
                  <div 
                    className="grid gap-1 p-1.5 bg-purple-950/30 rounded border border-dashed border-purple-500/40"
                    style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
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
                        <CardTooltip cardId={card.id} imageUrl={card.imageUrl} cardName={card.name} disabled={!!draggedCard}>
                          <img
                            src={card.imageUrlSmall}
                            alt={card.name}
                            className="w-full h-auto rounded border border-purple-600/30 hover:border-purple-400 transition-colors object-contain cursor-grab active:cursor-grabbing"
                          />
                        </CardTooltip>
                        {isOwner && isEditMode && (
                          <button
                            onClick={() => handleRemoveCard("extra", index)}
                            className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Side Deck - FUERA del container del deck principal */}
            {showSideDeck ? (
              <div className="space-y-2">
                <div className="bg-amber-900/30 px-2 py-1.5 rounded border-l-4 border-amber-500">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-semibold text-sm">Side Deck</span>
                      <span className="text-amber-300 text-xs">({sideDeck.length})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isOwner && isEditMode && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddCard("side", e.currentTarget);
                            }}
                            disabled={sideDeck.length >= 20}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white rounded text-xs transition-colors font-semibold disabled:cursor-not-allowed"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Add</span>
                          </button>
                          <button
                            onClick={handleRemoveSideDeck}
                            className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors font-semibold"
                            title="Remove Side Deck"
                          >
                            <X className="w-2.5 h-2.5" />
                            <span>Remove Side Deck</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div 
                  className="grid gap-0.5 p-1 bg-amber-950/30 rounded border border-amber-500/40"
                  style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
                >
                  {sideDeck.map((card, index) => (
                    <div
                      key={card.uniqueId}
                      className="relative group"
                      draggable={isOwner && isEditMode}
                      onDragStart={() => handleDragStart("side", index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop("side", index)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardTooltip cardId={card.id} imageUrl={card.imageUrl} cardName={card.name} disabled={!!draggedCard}>
                        <img
                          src={card.imageUrlSmall}
                          alt={card.name}
                          className="w-full h-auto rounded border border-amber-600/30 hover:border-amber-400 transition-colors object-contain cursor-grab active:cursor-grabbing"
                        />
                      </CardTooltip>
                      {isOwner && isEditMode && (
                        <button
                          onClick={() => handleRemoveCard("side", index)}
                          className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              isOwner && isEditMode && (
                <div className="text-center">
                  <button
                    onClick={handleAddSideDeck}
                    className="flex items-center gap-1.5 mx-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs transition-colors font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Side Deck</span>
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Card Search Modal */}
      {isSelectingCard && (
        <FloatingCardSearchModal
          isOpen={true}
          title={`Add Card to ${targetZone === "main" ? "Main" : targetZone === "extra" ? "Extra" : "Side"} Deck`}
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
