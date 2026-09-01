import { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Trash2,
  Lock,
  Globe,
  Edit2,
  Plus,
  Save,
  ChevronDown,
} from "lucide-react";
import { DeckZoneSection } from "@/features/archetypes/components/DeckZoneSection";
import { validateDeckCardAddition } from "@/features/archetypes/utils/deckValidation";
import {
  getDeckZoneLabel,
  type DeckDisplayZone,
} from "@/features/archetypes/utils/deckZonePresentation";
import { DeckBuilderCardSearchModal } from "@/features/archetypes/components/DeckBuilderCardSearchModal";
import type { CustomDeck } from "../api/customDeckApi";
import { sortDeckCards } from "@/shared/utils/sortDeckCards";
import { reorderCardsInZone } from "@/features/archetypes/utils/deckDragDrop";
import type { Card } from "@/features/archetypes/types";

interface DeckCard extends Card {
  uniqueId: string;
}

type DeckZone = "main" | "extra" | "side" | "header" | null;

interface PersonalDeckModalProps {
  deck?: CustomDeck; // Optional for creation mode
  isOwner: boolean;
  onClose: () => void;
  onSave?: (data: {
    title: string;
    mainDeckCards: number[];
    extraDeckCards: number[];
    sideDeckCards: number[];
    headerCardId?: number;
    isPublic: boolean;
  }) => void; // For creation
  onUpdate?: (
    deckId: number,
    updates: {
      title?: string;
      mainDeckCards?: number[];
      extraDeckCards?: number[];
      sideDeckCards?: number[];
      headerCardId?: number;
      isPublic?: boolean;
    },
  ) => void; // For editing
  onDelete?: (deckId: number, deckTitle: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export const PersonalDeckModal = ({
  deck,
  isOwner,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: PersonalDeckModalProps) => {
  const isCreationMode = !deck;

  // Initialize decks with uniqueIds (memoized for performance)
  const initializeDeck = useCallback((cards: Card[]): DeckCard[] => {
    return cards.map((card) => ({ ...card, uniqueId: crypto.randomUUID() }));
  }, []);

  const [mainDeck, setMainDeck] = useState<DeckCard[]>(() =>
    initializeDeck(deck?.mainDeck || []),
  );
  const [extraDeck, setExtraDeck] = useState<DeckCard[]>(() =>
    initializeDeck(deck?.extraDeck || []),
  );
  const [sideDeck, setSideDeck] = useState<DeckCard[]>(() =>
    initializeDeck(deck?.sideDeck || []),
  );
  const [isSideDeckOpen, setIsSideDeckOpen] = useState(false);
  const [showSideDeck, setShowSideDeck] = useState<boolean>(
    (deck?.sideDeck?.length || 0) > 0,
  );
  const [isPublic, setIsPublic] = useState(deck?.isPublic ?? true);
  const [title, setTitle] = useState(deck?.title || "Custom Deck");
  const [headerCard, setHeaderCard] = useState<Card | null>(null);
  const [hasChanges, setHasChanges] = useState(isCreationMode);
  const [isEditMode, setIsEditMode] = useState(isCreationMode);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [targetZone, setTargetZone] = useState<DeckZone>(null);
  const [draggedCard, setDraggedCard] = useState<{
    zone: DeckDisplayZone;
    index: number;
  } | null>(null);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, []);

  const isFloating = windowWidth <= 900;

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
  }, [
    deck?.id,
    deck?.mainDeck,
    deck?.extraDeck,
    deck?.sideDeck,
    deck?.title,
    deck?.isPublic,
    deck?.headerCard,
    initializeDeck,
    deck,
  ]);

  const handleAddCard = useCallback((zone: DeckZone, _anchor: HTMLElement) => {
    setTargetZone(zone);
    setIsSelectingCard(true);
  }, []);

  const handleCardSelected = (card: Card) => {
    if (targetZone === "header") {
      setHeaderCard(card);
      setHasChanges(true);
      setIsSelectingCard(false);
      setTargetZone(null);
      return;
    }

    if (!targetZone) {
      return;
    }

    const validationError = validateDeckCardAddition({
      card,
      targetZone,
      mainDeck,
      extraDeck,
      sideDeck,
    });

    if (validationError) {
      if (validationError.code !== "MAX_COPIES") {
        alert(validationError.message);
      }
      return;
    }

    const deckCard: DeckCard = { ...card, uniqueId: crypto.randomUUID() };

    if (targetZone === "main") {
      setMainDeck((prev) => sortDeckCards([...prev, deckCard]));
      setHasChanges(true);
    } else if (targetZone === "extra") {
      setExtraDeck((prev) => sortDeckCards([...prev, deckCard]));
      setHasChanges(true);
    } else if (targetZone === "side") {
      setSideDeck((prev) => sortDeckCards([...prev, deckCard]));
      setHasChanges(true);
    }
  };

  const handleRemoveCard = useCallback(
    (zone: DeckDisplayZone, index: number) => {
      if (!isOwner || !isEditMode) return;

      let removedCard: DeckCard | undefined;

      if (zone === "main") {
        setMainDeck((prev) => {
          removedCard = prev[index];
          return prev.filter((_, i) => i !== index);
        });
        setHasChanges(true);
      } else if (zone === "extra") {
        setExtraDeck((prev) => {
          removedCard = prev[index];
          return prev.filter((_, i) => i !== index);
        });
        setHasChanges(true);
      } else if (zone === "side") {
        setSideDeck((prev) => {
          removedCard = prev[index];
          return prev.filter((_, i) => i !== index);
        });
        setHasChanges(true);
      }

      // Clear header card if the removed card was the header card
      if (removedCard && headerCard && removedCard.id === headerCard.id) {
        setHeaderCard(null);
      }
    },
    [isOwner, isEditMode, headerCard],
  );

  // Drag and drop handlers (memoized for performance)
  const handleDragStart = useCallback(
    (zone: DeckDisplayZone, index: number) => {
      setDraggedCard({ zone, index });
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (zone: DeckDisplayZone, dropIndex: number) => {
      if (
        !draggedCard ||
        draggedCard.zone !== zone ||
        draggedCard.index === dropIndex
      ) {
        setDraggedCard(null);
        return;
      }

      if (zone === "main") {
        setMainDeck((prev) => reorderCardsInZone(prev, draggedCard!.index, dropIndex));
        setHasChanges(true);
      } else if (zone === "extra") {
        setExtraDeck((prev) => reorderCardsInZone(prev, draggedCard!.index, dropIndex));
        setHasChanges(true);
      } else if (zone === "side") {
        setSideDeck((prev) => reorderCardsInZone(prev, draggedCard!.index, dropIndex));
        setHasChanges(true);
      }

      setDraggedCard(null);
    },
    [draggedCard],
  );

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

    const mainDeckCards = mainDeck.map((card) => card.id);
    const extraDeckCards = extraDeck.map((card) => card.id);
    const sideDeckCards = sideDeck.map((card) => card.id);
    const headerCardId = headerCard?.id;

    if (isCreationMode && onSave) {
      onSave({
        title: title.trim(),
        mainDeckCards,
        extraDeckCards,
        sideDeckCards,
        headerCardId,
        isPublic,
      });
    } else if (!isCreationMode && deck && onUpdate) {
      onUpdate(deck.id, {
        title: title.trim(),
        mainDeckCards,
        extraDeckCards,
        sideDeckCards,
        headerCardId,
      });
      setHasChanges(false);
      setIsEditMode(false);
    }
  }, [
    hasChanges,
    title,
    mainDeck,
    extraDeck,
    sideDeck,
    headerCard,
    isPublic,
    deck,
    onUpdate,
    onSave,
    isCreationMode,
  ]);

  const handleClose = useCallback(() => {
    if (hasChanges && isEditMode) {
      const confirmed = confirm("Close without saving?");
      if (!confirmed) return;
    }
    onClose();
  }, [hasChanges, isEditMode, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // Backdrop click
  const handleBackdropClick = useCallback(() => {
    if (isEditMode) return;
    handleClose();
  }, [isEditMode, handleClose]);

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
      className="fixed inset-0 z-[400] overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* Flex row: deck builder on the left, search panel on the right */}
      <div className="flex items-start justify-center w-full min-h-full p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative flex flex-col w-full min-[640px]:max-w-[88%] min-[768px]:max-w-[83%] min-[1024px]:max-w-[78%] min-[1280px]:max-w-5xl max-h-[95vh] overflow-hidden rounded-[3px] border border-blue-500/20 bg-gradient-to-b from-blue-900/10 via-indigo-900/20 to-blue-900/10 shadow-[0_0_44px_rgba(37,99,235,0.16)]"
        >
          <div className="pointer-events-none absolute inset-x-1 top-4 h-24  bg-blue-700/10" />

          <div className="flex-shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-700/70 px-4 py-2.5 backdrop-blur-xl relative z-20">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              {isOwner && isEditMode ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setHasChanges(true);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm font-bold text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  maxLength={100}
                />
              ) : (
                <h2 className="text-base font-bold text-blue-100 truncate">
                  {title}
                </h2>
              )}
              {isOwner && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={handleTogglePublic}
                    disabled={isUpdating}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      isPublic
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/18"
                        : "bg-slate-800/70 text-slate-300 border border-slate-600/40 hover:bg-slate-700/80"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isPublic ? (
                      <Globe className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                    <span>{isPublic ? "Public" : "Private"}</span>
                  </button>
                </div>
              )}
              {!isOwner && !isPublic && (
                <div className="flex items-center gap-1 rounded-full border border-slate-600/40 bg-slate-800/70 px-2.5 py-1 text-xs font-medium text-slate-300">
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
                  className="flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-200 opacity-80 hover:opacity-100 hover:bg-sky-500/25 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="rounded-full border border-slate-600/40 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200  hover:bg-slate-700/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel Edit
                </button>
              )}
              {isOwner && hasChanges && (
                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200  hover:bg-emerald-500/22 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="w-3 h-3" />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              )}
              {isOwner && deck && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || isUpdating}
                  className="rounded-full border border-red-500/25 bg-red-500/10 p-1.5  hover:bg-red-500/18 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="rounded-full p-1.5  hover:bg-slate-800/60"
              >
                <X className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {!canView ? (
            <div className="relative z-10 p-20 text-center">
              <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">This deck is private</p>
              <p className="text-slate-500 text-sm mt-2">
                Only the owner can view this deck
              </p>
            </div>
          ) : (
            <div className="relative z-10 flex-1 min-h-0 overflow-auto space-y-2.5 p-3 sm:p-4 max-[400px]:p-2 scrollbar-cardpair">
              <div className="flex flex-wrap items-center gap-2 max-[400px]:gap-1">
                <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-200/90 max-[400px]:text-[8px] max-[400px]:px-1.5 max-[400px]:py-0.5">
                  {mainDeck.length} main
                </span>
                <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-200/90 max-[400px]:text-[8px] max-[400px]:px-1.5 max-[400px]:py-0.5">
                  {extraDeck.length} extra
                </span>
                {showSideDeck && (
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200/90 max-[400px]:text-[8px] max-[400px]:px-1.5 max-[400px]:py-0.5">
                    {sideDeck.length} side
                  </span>
                )}
              </div>

              {/* Header Card Selection */}
              {isOwner && isEditMode && (
                <div className="relative overflow-hidden rounded-[16px] border border-sky-400/15 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-indigo-950/80 p-2.5 shadow-[0_16px_34px_rgba(2,6,23,0.4)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.1),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_60%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:9px_9px] opacity-15" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(248,250,252,0.72)_1px,transparent_1.3px)] bg-[size:57px_57px] opacity-15" />

                  <div className="relative z-10 flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {headerCard ? (
                        <div className="relative group">
                          <img
                            src={headerCard.imageUrlCropped}
                            alt={headerCard.name}
                            className="h-[48px] w-[48px] rounded-xl border-2 border-cyan-500/70 object-cover shadow-[0_10px_24px_rgba(8,145,178,0.28)]"
                          />
                          <button
                            onClick={() => setHeaderCard(null)}
                            className="absolute -right-1 -top-1 rounded-full bg-red-600 p-0.5 text-white opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-xl border-2 border-dashed border-slate-600 bg-slate-950/50">
                          <Plus className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={(e) =>
                          handleAddCard("header", e.currentTarget)
                        }
                        className="flex items-center gap-1 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/16"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span className="truncate">
                          {headerCard
                            ? "Change Header"
                            : "Select Header"}
                        </span>
                      </button>
                      {headerCard && (
                        <p className="mt-1 truncate text-xs text-slate-300">
                          {headerCard.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <DeckZoneSection
                zone="main"
                cards={mainDeck}
                isEditMode={isEditMode}
                canEdit={isOwner && isEditMode}
                emptyMessage={
                  isOwner && isEditMode
                    ? `Click here to add cards to ${getDeckZoneLabel("main")}`
                    : `No cards in ${getDeckZoneLabel("main")}`
                }
                cardKey={(card) => card.uniqueId}
                onAddCard={handleAddCard}
                onRemoveCard={handleRemoveCard}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                draggedCardActive={!!draggedCard}
              />
              {(extraDeck.length > 0 || (isOwner && isEditMode)) && (
                <DeckZoneSection
                  zone="extra"
                  cards={extraDeck}
                  isEditMode={isEditMode}
                  canEdit={isOwner && isEditMode}
                  emptyMessage={
                    isOwner && isEditMode
                      ? `Click here to add cards to ${getDeckZoneLabel("extra")}`
                      : `No cards in ${getDeckZoneLabel("extra")}`
                  }
                  cardKey={(card) => card.uniqueId}
                  onAddCard={handleAddCard}
                  onRemoveCard={handleRemoveCard}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  draggedCardActive={!!draggedCard}
                />
              )}
              {!showSideDeck && !isOwner && !isEditMode ? null : (
                <div className="rounded-sm border border-yellow-400/30 bg-gradient-to-br from-[#1a1508] via-[#1f1a0a] to-[#1a1508] p-3 shadow-[0_18px_38px_rgba(2,6,23,0.32)]">
                  <button
                    onClick={() => setIsSideDeckOpen(!isSideDeckOpen)}
                    className="flex w-full items-center justify-between gap-3 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        Side Deck
                      </span>
                      <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200/90">
                        {sideDeck.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {showSideDeck && isOwner && isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSideDeck();
                          }}
                          className="rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-200 hover:bg-red-500/18"
                        >
                          Remove
                        </button>
                      )}
                      <ChevronDown
                        className={`w-5 h-5 text-yellow-300 ${isSideDeckOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden ${isSideDeckOpen ? "max-h-[2000px]" : "max-h-0"}`}
                  >
                    {showSideDeck ? (
                      <div className="max-h-[40vh] overflow-y-auto">
                        <DeckZoneSection
                          zone="side"
                          cards={sideDeck}
                          isEditMode={isEditMode}
                          canEdit={isOwner && isEditMode}
                          hideTitle
                          emptyMessage={
                            isOwner && isEditMode
                              ? `Click here to add cards to ${getDeckZoneLabel("side")}`
                              : `No cards in ${getDeckZoneLabel("side")}`
                          }
                          cardKey={(card) => card.uniqueId}
                          onAddCard={handleAddCard}
                          onRemoveCard={handleRemoveCard}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onDragEnd={handleDragEnd}
                          draggedCardActive={!!draggedCard}
                        />
                      </div>
                    ) : (
                      isOwner &&
                      isEditMode && (
                        <div className="text-center pt-4">
                          <button
                            onClick={handleAddSideDeck}
                            className="inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/16"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Side Deck</span>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inline card search panel — sits flush to the right of the deck builder */}
        {isSelectingCard && (
          <DeckBuilderCardSearchModal
            isOpen={true}
            title={`Add Card to ${targetZone === "main" ? "Main" : targetZone === "extra" ? "Extra" : targetZone === "side" ? "Side" : "Header"} Deck`}
            onSelectCard={handleCardSelected}
            onClose={() => {
              setIsSelectingCard(false);
              setTargetZone(null);
            }}
            floating={isFloating}
            autoCloseAfterSelect={false}
            maxHeight="90vh"
          />
        )}
      </div>
    </div>
  );
};
