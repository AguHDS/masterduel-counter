import { useState, useEffect } from "react";
import { Plus, Loader2, ChevronDown } from "lucide-react";
import { DeckBuilderCardSearchModal } from "@/features/archetypes/components/DeckBuilderCardSearchModal";
import { DeckZoneSection } from "@/features/archetypes/components/DeckZoneSection";
import { validateDeckCardAddition } from "@/features/archetypes/utils/deckValidation";
import {
  getDeckZoneLabel,
  type DeckDisplayZone,
} from "@/features/archetypes/utils/deckZonePresentation";
import { sortDeckCards } from "@/shared/utils/sortDeckCards";
import { reorderCardsInZone } from "@/features/archetypes/utils/deckDragDrop";
import type { Card } from "@/features/archetypes/types";

interface RecommendedDeckEditorProps {
  isEditMode: boolean;
  initialTitle?: string;
  initialMainDeck?: Card[];
  initialExtraDeck?: Card[];
  initialSideDeck?: Card[];
  onDeckChange?: (
    title: string,
    mainDeck: Card[],
    extraDeck: Card[],
    sideDeck: Card[],
  ) => void;
  onDelete?: () => Promise<void>;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
}

type DeckZone = "main" | "extra" | "side" | null;

/**
 * Editor component for managing the recommended deck associated with a guide
 */
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
  const [isSideDeckOpen, setIsSideDeckOpen] = useState(false);
  const [showSideDeck, setShowSideDeck] = useState<boolean>(
    initialSideDeck.length > 0,
  );
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [targetZone, setTargetZone] = useState<DeckZone>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  const [draggedCard, setDraggedCard] = useState<{
    zone: DeckDisplayZone;
    index: number;
  } | null>(null);

  useEffect(() => {
    if (forceCloseModal && isSelectingCard) {
      setIsSelectingCard(false);
      setTargetZone(null);
    }
  }, [forceCloseModal, isSelectingCard]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isFloating = windowWidth <= 1245;

  useEffect(() => {
    onModalStateChange?.(isSelectingCard);
  }, [isSelectingCard, onModalStateChange]);

  const hasDeck =
    mainDeck.length > 0 || extraDeck.length > 0 || sideDeck.length > 0;

  useEffect(() => {
    setMainDeck(sortDeckCards(initialMainDeck));
  }, [initialMainDeck]);

  useEffect(() => {
    setExtraDeck(sortDeckCards(initialExtraDeck));
  }, [initialExtraDeck]);

  useEffect(() => {
    setSideDeck(sortDeckCards(initialSideDeck));
    setShowSideDeck(initialSideDeck.length > 0);
  }, [initialSideDeck]);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const handleAddCard = (zone: DeckZone, _anchor: HTMLElement) => {
    setTargetZone(zone);
    setIsSelectingCard(true);
  };

  const handleCardSelected = (card: Card) => {
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

    if (targetZone === "main") {
      const newMainDeck = sortDeckCards([...mainDeck, card]);
      setMainDeck(newMainDeck);
      onDeckChange?.(title, newMainDeck, extraDeck, sideDeck);
      return;
    }

    if (targetZone === "extra") {
      const newExtraDeck = sortDeckCards([...extraDeck, card]);
      setExtraDeck(newExtraDeck);
      onDeckChange?.(title, mainDeck, newExtraDeck, sideDeck);
      return;
    }

    const newSideDeck = sortDeckCards([...sideDeck, card]);
    setSideDeck(newSideDeck);
    onDeckChange?.(title, mainDeck, extraDeck, newSideDeck);
  };

  const handleRemoveCard = (zone: DeckDisplayZone, index: number) => {
    if (zone === "main") {
      const newMainDeck = mainDeck.filter((_, i) => i !== index);
      setMainDeck(newMainDeck);
      onDeckChange?.(title, newMainDeck, extraDeck, sideDeck);
      return;
    }

    if (zone === "extra") {
      const newExtraDeck = extraDeck.filter((_, i) => i !== index);
      setExtraDeck(newExtraDeck);
      onDeckChange?.(title, mainDeck, newExtraDeck, sideDeck);
      return;
    }

    const newSideDeck = sideDeck.filter((_, i) => i !== index);
    setSideDeck(newSideDeck);
    onDeckChange?.(title, mainDeck, extraDeck, newSideDeck);
  };

  const handleDragStart = (zone: DeckDisplayZone, index: number) => {
    setDraggedCard({ zone, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (zone: DeckDisplayZone, dropIndex: number) => {
    if (!draggedCard || draggedCard.zone !== zone) {
      return;
    }

    if (draggedCard.index === dropIndex) {
      setDraggedCard(null);
      return;
    }

    if (zone === "main") {
      const newMainDeck = reorderCardsInZone(mainDeck, draggedCard.index, dropIndex);
      setMainDeck(newMainDeck);
      onDeckChange?.(title, newMainDeck, extraDeck, sideDeck);
    } else if (zone === "extra") {
      const newExtraDeck = reorderCardsInZone(extraDeck, draggedCard.index, dropIndex);
      setExtraDeck(newExtraDeck);
      onDeckChange?.(title, mainDeck, newExtraDeck, sideDeck);
    } else {
      const newSideDeck = reorderCardsInZone(sideDeck, draggedCard.index, dropIndex);
      setSideDeck(newSideDeck);
      onDeckChange?.(title, mainDeck, extraDeck, newSideDeck);
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
    onDeckChange?.(title, mainDeck, extraDeck, []);
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

  return (
    <div className="mt-8 flex flex-wrap items-stretch justify-center gap-4 max-[700px]:-mx-4 max-[700px]:sm:-mx-6">
      <div className="relative w-full min-[851px]:w-[75%] min-[1024px]:w-[85%] min-[1200px]:w-[62%] rounded-[26px] border border-blue-500/45 bg-gradient-to-br from-[#090d18] via-[#13182b] to-[#190f30] p-4 shadow-[0_0_44px_rgba(37,99,235,0.16)] sm:p-5 max-[400px]:p-3">
        <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-x-4 top-4 h-24 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 max-[400px]:gap-1">
                <h4 className="text-xl font-bold text-blue-200 break-words max-[500px]:text-lg max-[400px]:text-base">{title}</h4>
                <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-[10px] max-[400px]:text-[8px] max-[400px]:px-1.5 max-[400px]:py-0.5 font-semibold uppercase tracking-[0.24em] text-sky-200/90">
                  {mainDeck.length} main
                </span>
                <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] max-[400px]:text-[8px] max-[400px]:px-1.5 max-[400px]:py-0.5 font-semibold uppercase tracking-[0.24em] text-violet-200/90">
                  {extraDeck.length} extra
                </span>
                {showSideDeck && (
                  <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2.5 py-1 text-[10px] max-[400px]:text-[8px] max-[400px]:px-1.5 max-[400px]:py-0.5 font-semibold uppercase tracking-[0.24em] text-yellow-200/90">
                    {sideDeck.length} side
                  </span>
                )}
              </div>

              {isEditMode && (
                <div className="relative w-full overflow-hidden rounded-[18px] border border-sky-400/15 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-indigo-950/80 p-4 shadow-[0_16px_34px_rgba(2,6,23,0.4)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.1),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_60%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:9px_9px] opacity-15" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(248,250,252,0.72)_1px,transparent_1.3px)] bg-[size:57px_57px] opacity-15" />

                  <div className="relative z-10">
                    <label className="mb-2 block w-fit rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                      Deck Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setTitle(newTitle);
                        onDeckChange?.(newTitle, mainDeck, extraDeck, sideDeck);
                      }}
                      placeholder="Enter a title for your deck"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
                      maxLength={100}
                    />
                  </div>
                </div>
              )}
            </div>

            {isEditMode && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 self-start rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/18 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Deck</span>
                )}
              </button>
            )}
          </div>

          <div className="mb-5 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

          <div className="space-y-5">
            <DeckZoneSection
              zone="main"
              cards={mainDeck}
              isEditMode={isEditMode}
              canEdit={isEditMode}
              emptyMessage={
                isEditMode
                  ? `Click here to add cards to ${getDeckZoneLabel("main")}`
                  : `No cards in ${getDeckZoneLabel("main")}`
              }
              cardKey={(card, index) => `main-${card.id}-${index}`}
              onAddCard={handleAddCard}
              onRemoveCard={handleRemoveCard}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              draggedCardActive={!!draggedCard}
            />
            {(extraDeck.length > 0 || isEditMode) && (
              <DeckZoneSection
                zone="extra"
                cards={extraDeck}
                isEditMode={isEditMode}
                canEdit={isEditMode}
                emptyMessage={
                  isEditMode
                    ? `Click here to add cards to ${getDeckZoneLabel("extra")}`
                    : `No cards in ${getDeckZoneLabel("extra")}`
                }
                cardKey={(card, index) => `extra-${card.id}-${index}`}
                onAddCard={handleAddCard}
                onRemoveCard={handleRemoveCard}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                draggedCardActive={!!draggedCard}
              />
            )}
            {(!showSideDeck && !isEditMode) ? null : (
              <div className="rounded-sm border border-yellow-400/30 bg-gradient-to-br from-[#1a1508] via-[#1f1a0a] to-[#1a1508] p-4 shadow-[0_18px_38px_rgba(2,6,23,0.32)]">
                <button
                  onClick={() => setIsSideDeckOpen(!isSideDeckOpen)}
                  className="flex w-full items-center justify-between gap-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">Side Deck</span>
                    <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200/90">
                      {sideDeck.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {showSideDeck && isEditMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveSideDeck(); }}
                        className="rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-200 transition-colors hover:bg-red-500/18"
                      >
                        Remove
                      </button>
                    )}
                    <ChevronDown className={`w-5 h-5 text-yellow-300 transition-transform duration-200 ${isSideDeckOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isSideDeckOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
                  {showSideDeck ? (
                    <DeckZoneSection
                      zone="side"
                      cards={sideDeck}
                      isEditMode={isEditMode}
                      canEdit={isEditMode}
                      hideTitle
                      emptyMessage={
                        isEditMode
                          ? `Click here to add cards to ${getDeckZoneLabel("side")}`
                          : `No cards in ${getDeckZoneLabel("side")}`
                      }
                      cardKey={(card, index) => `side-${card.id}-${index}`}
                      onAddCard={handleAddCard}
                      onRemoveCard={handleRemoveCard}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      draggedCardActive={!!draggedCard}
                    />
                  ) : (
                    <div className="text-center pt-4">
                      <button
                        onClick={handleAddSideDeck}
                        className="inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-200 transition-colors hover:bg-yellow-500/16"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Side Deck</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!hasDeck && isEditMode && (
              <div className="rounded-[18px] border border-dashed border-slate-700/70 bg-slate-950/25 px-5 py-10 text-center text-sm text-slate-400">
                Add cards to create a recommended deck for this guide.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline card search panel — sits flush to the right of the deck builder */}
      {isSelectingCard && (
        <DeckBuilderCardSearchModal
          isOpen={true}
          onClose={() => {
            setIsSelectingCard(false);
            setTargetZone(null);
          }}
          onSelectCard={handleCardSelected}
          title={`Add Cards to ${targetZone === "main" ? "Main" : targetZone === "extra" ? "Extra" : "Side"} Deck`}
          floating={isFloating}
          panelClassName={!isFloating ? "!w-[464px]" : undefined}
          autoCloseAfterSelect={false}
          maxHeight="80vh"
        />
      )}
    </div>
  );
};
