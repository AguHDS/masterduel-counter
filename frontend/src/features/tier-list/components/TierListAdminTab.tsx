import { useState, useEffect } from "react";
import { useTierListAdmin } from "../hooks/useTierList";
import {
  Swords,
  Plus,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";
import { FloatingCardSearchModal } from "@/features/archetypes/components/FloatingCardSearchModal";
import { confirmCards } from "@/features/archetypes/api/archetypesApi";
import type { TierListEntry } from "../types/tierList.types";
import type { Card } from "@/features/archetypes/types";

interface EditableEntry {
  id: number;
  deckName: string;
  tier: number;
  position: number;
  imageUrl: string | null;
  source: "scraped" | "manual";
  _isNew?: boolean;
  _isDeleted?: boolean;
}

/** Tab for managing the tierslist in Admin Panel */
export const TierListAdminTab = () => {
  const { entries, config, toggleScraping, triggerScrape, saveTierList, isSaving, isScraping } =
    useTierListAdmin("masterduel");

  const [editedEntries, setEditedEntries] = useState<EditableEntry[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCardSearchOpen, setIsCardSearchOpen] = useState(false);
  const [cardSearchAnchor, setCardSearchAnchor] = useState<HTMLElement | null>(null);
  const [cardSearchTargetId, setCardSearchTargetId] = useState<number | null>(null);

  useEffect(() => {
    if (entries.data && !hasChanges) {
      const existing = entries.data.filter((e) => e.isActive).map((e) => ({
        id: e.id,
        deckName: e.deckName,
        tier: e.tier,
        position: e.position,
        imageUrl: e.imageUrl,
        source: e.source,
      }));
      setEditedEntries(existing);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.data]);

  const markChanged = () => setHasChanges(true);

  const updateEntry = (id: number, updates: Partial<EditableEntry>) => {
    setEditedEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
    markChanged();
  };

  const removeEntry = (id: number) => {
    setEditedEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, _isDeleted: true } : e)),
    );
    markChanged();
  };

  const addEntry = (tier: number) => {
    const newId = -Date.now();
    setEditedEntries((prev) => [
      ...prev,
      {
        id: newId,
        deckName: "New Deck",
        tier,
        position: prev.filter((e) => e.tier === tier).length,
        imageUrl: null,
        source: "manual",
        _isNew: true,
      },
    ]);
    markChanged();
  };

  const handleSave = () => {
    const activeEntries = editedEntries
      .filter((e) => !e._isDeleted)
      .map((e, index) => ({
        id: e._isNew ? undefined : e.id,
        deckName: e.deckName,
        tier: e.tier,
        position: index,
        imageUrl: e.imageUrl,
        source: e.source,
      }));

    saveTierList.mutate(
      { format: "masterduel", entries: activeEntries as TierListEntry[] },
      {
        onSuccess: () => setHasChanges(false),
      },
    );
  };

  const handleScrape = () => {
    triggerScrape.mutate();
  };

  const handleOpenCardPicker = (entryId: number, anchor: HTMLElement) => {
    setCardSearchAnchor(anchor);
    setCardSearchTargetId(entryId);
    setIsCardSearchOpen(true);
  };

  const handleCardSelect = async (card: Card) => {
    if (cardSearchTargetId !== null) {
      try {
        await confirmCards([card.id]);
      } catch {
        // Non-fatal: image may still work via URL
      }
      updateEntry(cardSearchTargetId, { imageUrl: card.imageUrlCropped });
    }
    setIsCardSearchOpen(false);
    setCardSearchTargetId(null);
    setCardSearchAnchor(null);
  };

  const handleCloseCardSearch = () => {
    setIsCardSearchOpen(false);
    setCardSearchTargetId(null);
    setCardSearchAnchor(null);
  };

  const displayEntries = editedEntries.filter((e) => !e._isDeleted);

  const tierConfig: Record<number, {
    label: string;
    bgGradient: string;
    border: string;
    textColor: string;
  }> = {
    1: {
      label: "T1",
      bgGradient: "from-amber-600/40 via-amber-700/30 to-amber-900/40",
      border: "border-amber-500/30",
      textColor: "text-amber-300",
    },
    2: {
      label: "T2",
      bgGradient: "from-slate-500/30 via-slate-600/25 to-slate-800/35",
      border: "border-slate-400/25",
      textColor: "text-slate-300",
    },
    3: {
      label: "T3",
      bgGradient: "from-orange-700/35 via-orange-800/30 to-orange-950/40",
      border: "border-orange-600/25",
      textColor: "text-orange-300",
    },
  };

  const sourceBadge = (source: string) => (
    <span
      className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
        source === "scraped"
          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
      }`}
    >
      {source}
    </span>
  );

  return (
    <div>
      {/* Controls bar */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button
          onClick={handleScrape}
          disabled={isScraping}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isScraping ? "animate-spin" : ""}`} />
          {isScraping ? "Scraping..." : "Scrape Now"}
        </button>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.data?.scrapingEnabled ?? false}
            onChange={(e) =>
              toggleScraping.mutate({
                format: "masterduel",
                enabled: e.target.checked,
              })
            }
            className="w-4 h-4 rounded border-slate-500 bg-slate-800 accent-amber-500"
          />
          <span className="text-slate-300 text-sm">Auto-scrape every 12h</span>
        </label>

        {config.data?.lastScrapedAt && (
          <span className="text-slate-500 text-xs">
            Last scrape: {new Date(config.data.lastScrapedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Loading */}
      {entries.isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400" />
        </div>
      )}

      {/* Tier sections */}
      {!entries.isLoading && (
        <div className="border border-slate-500/20 rounded-xl overflow-hidden bg-black/30">
          {[1, 2, 3].map((tier, tierIndex, arr) => {
            const tierEntries = displayEntries.filter((e) => e.tier === tier);
            const cfg = tierConfig[tier];
            const isLast = tierIndex === arr.length - 1;

            return (
              <div key={tier} className={`flex ${isLast ? "" : "border-b border-slate-500/15"}`}>
                <div
                  className={`w-[60px] sm:w-[72px] flex-shrink-0 flex flex-col items-center justify-center py-4 bg-gradient-to-b ${cfg.bgGradient} border-r ${cfg.border}`}
                >
                  <span className={`text-2xl sm:text-3xl font-black italic tracking-tighter ${cfg.textColor} drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="flex-1 min-w-0 p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => addEntry(tier)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/40 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Deck
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {tierEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="relative rounded-lg overflow-hidden shadow-lg shadow-black/50 group border border-slate-600/30"
                        style={{ background: "linear-gradient(to bottom, #111827, #0b0d14)" }}
                      >
                        {sourceBadge(entry.source)}

                        <div className="w-full aspect-[16/10] overflow-hidden relative">
                          {entry.imageUrl ? (
                            <img
                              src={getOptimizedCardImageUrl(entry.imageUrl, { size: "full" })}
                              alt={entry.deckName}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800/60 flex items-center justify-center">
                              <Swords className="w-8 h-8 text-slate-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <button
                              onClick={(e) => handleOpenCardPicker(entry.id, e.currentTarget)}
                              className="px-3 py-1.5 bg-amber-500/90 hover:bg-amber-500 text-black text-xs font-bold rounded"
                            >
                              Select Card Image
                            </button>
                          </div>
                        </div>

                        <div
                          className="px-3 py-2.5 flex flex-col gap-1.5"
                          style={{
                            background: "linear-gradient(to top, rgba(8,10,25,0.94) 50%, rgba(8,10,20,0.0) 100%)",
                            WebkitBackdropFilter: "blur(8px)",
                          }}
                        >
                          <input
                            type="text"
                            value={entry.deckName}
                            onChange={(e) => updateEntry(entry.id, { deckName: e.target.value })}
                            className="w-full bg-transparent text-slate-100 font-bold text-sm border-b border-slate-600/50 focus:border-amber-500/70 outline-none pb-0.5"
                          />

                          <div className="flex items-center gap-2">
                            <select
                              value={entry.tier}
                              onChange={(e) => updateEntry(entry.id, { tier: parseInt(e.target.value) })}
                              className="bg-slate-800 border border-slate-600/50 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:border-amber-500/70"
                            >
                              <option value={1}>Tier 1</option>
                              <option value={2}>Tier 2</option>
                              <option value={3}>Tier 3</option>
                            </select>

                            <select
                              value={entry.source}
                              onChange={(e) => updateEntry(entry.id, { source: e.target.value as "scraped" | "manual" })}
                              className="bg-slate-800 border border-slate-600/50 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:border-amber-500/70"
                              title="Scraped entries get overwritten on next scrape. Set to Manual to protect your changes."
                            >
                              <option value="scraped">Scraped</option>
                              <option value="manual">Manual</option>
                            </select>

                            <button
                              onClick={() => removeEntry(entry.id)}
                              className="ml-auto p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Card Search Modal */}
      <FloatingCardSearchModal
        isOpen={isCardSearchOpen}
        onClose={handleCloseCardSearch}
        onSelectCard={handleCardSelect}
        title="Select Card Image"
        anchorElement={cardSearchAnchor}
        autoCloseAfterSelect={true}
      />

      {/* Save bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1020] border-t border-yellow-600/40 shadow-[0_-10px_50px_-5px_rgba(0,0,0,0.5)] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-amber-300 text-sm font-medium">
              You have unsaved changes
            </p>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600/90 hover:bg-yellow-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 transition-colors shadow-lg shadow-yellow-600/20"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {hasChanges && <div className="h-20" />}
    </div>
  );
};
