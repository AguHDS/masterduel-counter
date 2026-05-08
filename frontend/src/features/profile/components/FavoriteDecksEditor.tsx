import { useState, useEffect } from "react";
import { X, Layers, Wand2, Plus } from "lucide-react";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";
import type { FavoriteDeck } from "../types/profileTypes";
import type { CustomDeck } from "../api/customDeckApi";

interface FavoriteDecksEditorProps {
  favoriteDecks: (FavoriteDeck | null)[];
  isEditMode: boolean;
  onDecksUpdate: (decks: (FavoriteDeck | null)[]) => void;
  customDecks: CustomDeck[];
  isCustomDecksLoaded?: boolean;
  onNavigateToDecks: () => void;
  onDeckClick?: (deckId: number) => void;
}

const getDeckPreviewImage = (deck: CustomDeck): string | null =>
  deck.headerCard?.imageUrlCropped ??
  deck.extraDeck[0]?.imageUrlCropped ??
  deck.mainDeck[0]?.imageUrlCropped ??
  null;

export const FavoriteDecksEditor = ({
  favoriteDecks,
  isEditMode,
  onDecksUpdate,
  customDecks,
  isCustomDecksLoaded = false,
  onNavigateToDecks,
  onDeckClick,
}: FavoriteDecksEditorProps) => {
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [viewingCardUrl, setViewingCardUrl] = useState<string | null>(null);

  // Auto-remove deleted decks from favorites when customDecks updates
  useEffect(() => {
    if (!isCustomDecksLoaded) return;
    const deckIds = new Set(customDecks.map((d) => d.id));
    const cleaned = favoriteDecks.map((d) =>
      d !== null && !deckIds.has(d.deckId) ? null : d,
    );
    if (cleaned.some((d, i) => d !== favoriteDecks[i])) {
      onDecksUpdate(cleaned);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDecks, isCustomDecksLoaded]);

  const openPicker = (slotIndex: number) => setPickerSlot(slotIndex);
  const closePicker = () => setPickerSlot(null);

  const handleSelectDeck = (deck: CustomDeck) => {
    if (pickerSlot === null) return;
    const newDeck: FavoriteDeck = {
      deckId: deck.id,
    };
    const newDecks: (FavoriteDeck | null)[] = [...favoriteDecks];
    while (newDecks.length < 6) newDecks.push(null);
    newDecks[pickerSlot] = newDeck;
    onDecksUpdate(newDecks);
    closePicker();
  };

  const handleRemoveDeck = (slotIndex: number) => {
    const newDecks: (FavoriteDeck | null)[] = [...favoriteDecks];
    newDecks[slotIndex] = null;
    onDecksUpdate(newDecks);
  };

  const usedDeckIds = new Set(
    favoriteDecks.filter(Boolean).map((d) => d!.deckId),
  );

  const slots = [0, 1, 2, 3, 4, 5];

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-yellow-500 font-bold text-lg whitespace-nowrap">
          Favorite Decks
        </h2>
        <div className="flex-1 border-t border-yellow-600"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 min-[1376px]:grid-cols-3 gap-3">{slots.map((slotIndex) => {
          const savedDeck = favoriteDecks[slotIndex];
          // Live-resolve deck data from customDecks so edits are reflected immediately
          const liveDeck = savedDeck
            ? (customDecks.find((d) => d.id === savedDeck.deckId) ?? null)
            : null;
          const isDeckLoading = !!savedDeck && !isCustomDecksLoaded;
          // Treat as empty if customDecks loaded and deck was deleted.
          // We intentionally avoid using saved snapshot fields while loading
          // to prevent showing stale header images.
          const deck = savedDeck && liveDeck
            ? {
                deckId: savedDeck.deckId,
                title: liveDeck.title,
                imageUrl: getDeckPreviewImage(liveDeck),
                mainCount: liveDeck.mainDeck.length,
                extraCount: liveDeck.extraDeck.length,
                sideCount: liveDeck.sideDeck.length,
              }
            : null;

          return (
            <div key={slotIndex} className="relative group">
              {isDeckLoading ? (
                <div
                  className="relative rounded-lg overflow-hidden shadow-lg shadow-black/50"
                  style={{ background: "linear-gradient(to bottom, #111827, #0b0d14)" }}
                >
                  <div className="w-full aspect-[3/2] bg-slate-800/50 animate-pulse" />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2 py-2"
                    style={{
                      background: "linear-gradient(to top, rgba(8,10,25,0.92) 50%, rgba(8,10,20,0.0) 100%)",
                      WebkitBackdropFilter: "blur(6px)",
                    }}
                  >
                    <p className="text-slate-300 font-bold text-xs truncate">
                      Loading deck...
                    </p>
                  </div>
                </div>
              ) : deck ? (
                <div
                  className="relative rounded-lg overflow-hidden shadow-lg shadow-black/50 group cursor-pointer"
                  style={{ background: "linear-gradient(to bottom, #111827, #0b0d14)" }}
                  onClick={() => !isEditMode && onDeckClick?.(deck.deckId)}
                >
                  {/* Image */}
                  <div className="w-full aspect-[3/2] overflow-hidden relative">
                    {deck.imageUrl ? (
                      <img
                        src={getOptimizedCardImageUrl(deck.imageUrl, { size: 'thumbnail', width: 400, height: 400 })}
                        alt={deck.title}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onClick={(e) => {
                          if (isEditMode) {
                            e.stopPropagation();
                            setViewingCardUrl(deck.imageUrl);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800/60 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                  </div>

                  {/* Name bar with frosted glass */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                    style={{
                      background: "linear-gradient(to top, rgba(8,10,25,0.92) 50%, rgba(8,10,20,0.0) 100%)",
                      WebkitBackdropFilter: "blur(6px)",
                    }}
                  >
                    <p className="text-slate-100 font-bold text-xs truncate">
                      {deck.title}
                    </p>
                    <p className="text-[10px] mt-0.5">
                      <span className="text-cyan-400">Main</span>
                      <span className="text-slate-300">: {deck.mainCount}</span>
                      <span className="text-slate-500"> · </span>
                      <span className="text-purple-400">Extra</span>
                      <span className="text-slate-300">: {deck.extraCount}</span>
                      {deck.sideCount > 0 && (
                        <>
                          <span className="text-slate-500"> · </span>
                          <span className="text-amber-400">Side</span>
                          <span className="text-slate-300">: {deck.sideCount}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Edit controls on hover */}
                  {isEditMode && (
                    <div className="absolute top-1.5 right-1.5 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); openPicker(slotIndex); }}
                        className="w-6 h-6 flex items-center justify-center bg-[#08041a] border border-amber-500/70 hover:border-amber-400 hover:bg-amber-900/30 transition-colors shadow-lg shadow-black/60"
                        title="Change deck"
                      >
                        <Wand2 className="w-3 h-3 text-amber-400" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveDeck(slotIndex); }}
                        className="w-6 h-6 flex items-center justify-center bg-[#08041a] border border-red-700/70 hover:border-red-500 hover:bg-red-900/30 transition-colors shadow-lg shadow-black/60"
                        title="Remove deck"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              ) : isEditMode ? (
                <button
                  onClick={() => openPicker(slotIndex)}
                  className="w-full aspect-[3/2] rounded-lg border border-dashed border-amber-600/35 bg-purple-950/15 hover:border-amber-500/55 hover:bg-purple-950/30 flex flex-col items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-5 h-5 text-amber-400/60" />
                  <p className="text-amber-300/60 text-[10px] font-bold tracking-[0.16em] uppercase">Add Deck</p>
                </button>
              ) : (
                <div className="w-full aspect-[3/2] rounded-lg border border-yellow-600/15 bg-purple-950/15 flex items-center justify-center">
                  <p className="text-slate-600 text-[10px]">Empty slot</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Decks button */}
      <div className="mt-5 px-1">
        <button
          onClick={onNavigateToDecks}
          className="relative w-full py-2.5 group overflow-hidden rounded"
        >
          <div
            className="absolute inset-0 rounded"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(234,179,8,0.10) 50%, transparent 100%)' }}
          />
          <div className="absolute inset-0 border border-yellow-600/40 rounded group-hover:border-yellow-500/60 transition-colors" />
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/55 to-transparent" />
          <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-500/55 to-transparent" />
          <span className="relative text-yellow-400 font-bold text-[11px] tracking-[0.20em] uppercase group-hover:text-yellow-300 transition-colors">
            ◆ View All Decks ◆
          </span>
        </button>
      </div>

      {/* Deck picker modal */}
      {pickerSlot !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={closePicker}
        >
          <div
            className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-xl border border-yellow-600/40 bg-[#0d1020] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-600/20">
              <h3 className="text-yellow-400 font-bold text-base">Select a Deck</h3>
              <button
                onClick={closePicker}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: no decks */}
            {customDecks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
                <p className="text-slate-400 text-md text-center">
                  You don't have any decks yet.
                </p>
                <button
                  onClick={() => { closePicker(); onNavigateToDecks(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600/80 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Create Deck
                </button>
              </div>
            ) : (
              /* Body: deck list */
              <ul className="overflow-y-auto scrollbar-cardpair flex-1 divide-y divide-white/5">
                {customDecks.map((deck) => {
                  const preview = getDeckPreviewImage(deck);
                  const isAlreadyUsed =
                    usedDeckIds.has(deck.id) &&
                    favoriteDecks[pickerSlot]?.deckId !== deck.id;
                  return (
                    <li key={deck.id}>
                      <button
                        disabled={isAlreadyUsed}
                        onClick={() => handleSelectDeck(deck)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                          isAlreadyUsed
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-yellow-600/10"
                        }`}
                      >
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-slate-800">
                          {preview ? (
                            <img
                              src={preview}
                              alt={deck.title}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Layers className="w-5 h-5 text-slate-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-100 font-semibold text-sm truncate">
                            {deck.title}
                          </p>
                          <p className="text-xs mt-0.5">
                            <span className="text-cyan-400">Main</span>
                            <span className="text-slate-500">: {deck.mainDeck.length}</span>
                            <span className="text-slate-600"> · </span>
                            <span className="text-purple-400">Extra</span>
                            <span className="text-slate-500">: {deck.extraDeck.length}</span>
                            {deck.sideDeck.length > 0 && (
                              <>
                                <span className="text-slate-600"> · </span>
                                <span className="text-amber-400">Side</span>
                                <span className="text-slate-500">: {deck.sideDeck.length}</span>
                              </>
                            )}
                          </p>
                        </div>
                        {isAlreadyUsed && (
                          <span className="text-[10px] text-slate-500 font-medium flex-shrink-0">
                            In use
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Full-size image viewer */}
      {viewingCardUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setViewingCardUrl(null)}
        >
          <div className="relative top-5 max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={viewingCardUrl}
              alt="Card view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
