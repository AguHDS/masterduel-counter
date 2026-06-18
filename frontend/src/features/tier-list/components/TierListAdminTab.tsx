import { useState, useEffect, useRef } from "react";
import { useTierListAdmin } from "../hooks/useTierList";
import {
  Swords,
  Plus,
  X,
  Save,
  RefreshCw,
  Link,
  Search,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";
import { FloatingCardSearchModal } from "@/features/archetypes/components/FloatingCardSearchModal";
import { InfoModal } from "@/shared/components/info/components/InfoModal";
import { confirmCards } from "@/features/archetypes/api/archetypesApi";
import { useSearchArchetypes } from "@/features/archetypes/hooks/useArchetypes";
import type { TierListEntry } from "../types/tierList.types";
import type { Card } from "@/features/archetypes/types";
import type { Archetype } from "@/features/archetypes/types";

interface EditableEntry {
  id: number;
  deckName: string;
  tier: number;
  position: number;
  imageUrl: string | null;
  source: "scraped" | "manual";
  linkedArchetypeId: number | null;
  linkedArchetypeName: string | null;
  _isNew?: boolean;
  _isDeleted?: boolean;
}

/** Tab for managing the tierslist in Admin Panel */
export const TierListAdminTab = () => {
  const [format, setFormat] = useState<"masterduel" | "tcg" | "ocg">("masterduel");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { entries, config, toggleScraping, triggerScrape, saveTierList, isSaving, isScraping } =
    useTierListAdmin(format);

  const [editedEntries, setEditedEntries] = useState<EditableEntry[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCardSearchOpen, setIsCardSearchOpen] = useState(false);
  const [cardSearchAnchor, setCardSearchAnchor] = useState<HTMLElement | null>(null);
  const [cardSearchTargetId, setCardSearchTargetId] = useState<number | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkTargetId, setLinkTargetId] = useState<number | null>(null);
  const [archetypeSearchQuery, setArchetypeSearchQuery] = useState("");
  const { data: archetypeResponse, isLoading: archetypeLoading } = useSearchArchetypes(archetypeSearchQuery, 20);
  const archetypeResults = archetypeResponse?.data?.archetypes ?? [];
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [dragSourceId, setDragSourceId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const FORMATS: { key: "masterduel" | "tcg" | "ocg"; label: string }[] = [
    { key: "masterduel", label: "Master Duel" },
    { key: "tcg", label: "TCG" },
    { key: "ocg", label: "OCG" },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (entries.data && !hasChanges) {
      const existing = entries.data.filter((e) => e.isActive).map((e) => ({
        id: e.id,
        deckName: e.deckName,
        tier: e.tier,
        position: e.position,
        imageUrl: e.imageUrl,
        source: e.source,
        linkedArchetypeId: e.linkedArchetypeId,
        linkedArchetypeName: e.linkedArchetypeName,
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
      linkedArchetypeId: null,
      linkedArchetypeName: null,
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
        linkedArchetypeId: e.linkedArchetypeId,
        linkedArchetypeName: e.linkedArchetypeName,
      }));

    saveTierList.mutate(
      { format, entries: activeEntries as TierListEntry[] },
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

  const handleOpenLinkModal = (entryId: number) => {
    setLinkTargetId(entryId);
    setArchetypeSearchQuery("");
    setIsLinkModalOpen(true);
  };

  const handleSelectArchetype = (archetype: Archetype) => {
    if (linkTargetId !== null) {
      updateEntry(linkTargetId, {
        linkedArchetypeId: archetype.id,
        linkedArchetypeName: archetype.name,
      });
    }
    setIsLinkModalOpen(false);
    setLinkTargetId(null);
    setArchetypeSearchQuery("");
  };

  const handleRemoveLink = (entryId: number) => {
    updateEntry(entryId, { linkedArchetypeId: null, linkedArchetypeName: null });
  };

  const handleDragStart = (e: React.DragEvent, entryId: number) => {
    setDragSourceId(entryId);
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDragSourceId(null);
    setDragOverId(null);
    (e.currentTarget as HTMLElement).classList.remove("opacity-50");
  };

  const handleDragOver = (e: React.DragEvent, entryId: number) => {
    e.preventDefault();
    if (dragSourceId !== entryId) {
      setDragOverId(entryId);
    }
  };

  // For drag
  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (dragSourceId === null || dragSourceId === targetId) return;

    const reordered = [...editedEntries];
    const sourceIdx = reordered.findIndex((en) => en.id === dragSourceId);
    const targetIdx = reordered.findIndex((en) => en.id === targetId);

    if (sourceIdx === -1 || targetIdx === -1) return;

    const sourceEntry = reordered[sourceIdx];
    const targetEntry = reordered[targetIdx];
    if (sourceEntry.tier !== targetEntry.tier) return;

    const [removed] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, removed);
    reordered.forEach((en, i) => { en.position = i; });

    setEditedEntries(reordered);
    setDragSourceId(null);
    setDragOverId(null);
    markChanged();
  };

  const displayEntries = editedEntries.filter((e) => !e._isDeleted);

  const tierConfig: Record<number, {
    label: string;
    bgGradient: string;
    border: string;
    textColor: string;
    cardBg: string;
  }> = {
    0: {
      label: "T0",
      bgGradient: "from-sky-400/50 via-violet-400/35 to-violet-700/50",
      border: "border-sky-400/30",
      textColor: "text-sky-200",
      cardBg: "from-sky-950/50 via-violet-900/25 to-slate-950/80",
    },
    1: {
      label: "T1",
      bgGradient: "from-amber-400/50 via-amber-500/35 to-amber-700/50",
      border: "border-amber-400/30",
      textColor: "text-amber-200",
      cardBg: "from-amber-950/50 via-amber-900/20 to-slate-950/80",
    },
    2: {
      label: "T2",
      bgGradient: "from-slate-500/30 via-slate-600/25 to-slate-800/35",
      border: "border-slate-400/25",
      textColor: "text-slate-300",
      cardBg: "from-slate-800/40 via-slate-900/20 to-slate-950/80",
    },
    3: {
      label: "T3",
      bgGradient: "from-orange-700/35 via-orange-800/30 to-orange-950/40",
      border: "border-orange-600/25",
      textColor: "text-orange-300",
      cardBg: "from-orange-950/50 via-orange-900/20 to-slate-950/80",
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
        {/* Format selector */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-600 hover:border-amber-500/40 rounded-lg text-sm font-semibold text-slate-200 transition-colors"
          >
            {FORMATS.find((f) => f.key === format)?.label ?? "Master Duel"}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          <div
            className={`absolute top-full mt-1 left-0 z-50 min-w-[160px] bg-[#1f1a24] border border-amber-500/30 rounded-lg shadow-xl shadow-black/50 overflow-hidden transition-all duration-200 origin-top ${
              dropdownOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-95 pointer-events-none"
            }`}
          >
            {FORMATS.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFormat(f.key); setDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  format === f.key
                    ? "bg-amber-500/15 text-amber-300 font-semibold"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-amber-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

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
                format,
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

        <button
          onClick={() => setIsHelpOpen(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg text-xs font-semibold transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
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
          {[...new Set(displayEntries.map((e) => e.tier))].sort((a, b) => a - b).map((tier, tierIndex, arr) => {
            const tierEntries = displayEntries.filter((e) => e.tier === tier);
            const cfg = tierConfig[tier];
            const isLast = tierIndex === arr.length - 1;

            return (
              <div key={tier} className={`flex ${isLast ? "" : "border-b border-slate-500/15"}`}>
                <div
                  className={`w-[44px] sm:w-[60px] md:w-[72px] flex-shrink-0 flex flex-col items-center justify-center py-4 bg-gradient-to-b ${cfg.bgGradient} border-r ${cfg.border}`}
                >
                  <span className={`text-2xl sm:text-3xl font-black italic tracking-tighter ${cfg.textColor} drop-shadow-[0_0_4px_rgba(0,0,0,0.4)]`}>
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
                        draggable
                        onDragStart={(e) => handleDragStart(e, entry.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, entry.id)}
                        onDrop={(e) => handleDrop(e, entry.id)}
                        className={`relative rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] min-[501px]:shadow-none group border transition-all duration-200 bg-gradient-to-b ${cfg.cardBg} ${
                          dragOverId === entry.id ? "border-amber-400/60 shadow-[0_0_6px_-1px_rgba(245,158,11,0.12)]" : "border-slate-600/30"
                        }`}
                      >
                        {sourceBadge(entry.source)}

                        {/* Link Archetype button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenLinkModal(entry.id); }}
                          className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            entry.linkedArchetypeId
                              ? "bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30"
                              : "bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30"
                          }`}
                          title={entry.linkedArchetypeId ? `Linked to: ${entry.linkedArchetypeName}` : "Link to archetype"}
                        >
                          <Link className="w-3 h-3 inline mr-1" />
                          {entry.linkedArchetypeName || "Link"}
                        </button>

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
                          className="px-3 pt-2.5 flex flex-col gap-1.5"
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
                              <option value={0}>Tier 0</option>
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

      {/* Link Archetype Modal */}
      {isLinkModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => { setIsLinkModalOpen(false); setLinkTargetId(null); }}
        >
          <div
            className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-xl border border-yellow-600/40 bg-[#0d1020] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-600/20">
              <h3 className="text-yellow-400 font-bold text-base">Link to Archetype</h3>
              <button
                onClick={() => { setIsLinkModalOpen(false); setLinkTargetId(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={archetypeSearchQuery}
                  onChange={(e) => setArchetypeSearchQuery(e.target.value)}
                  placeholder="Search archetypes..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg outline-none focus:border-amber-500/70"
                  autoFocus
                />
              </div>

              <div className="max-h-[50vh] overflow-y-auto">
                {archetypeLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400" />
                  </div>
                )}

                {linkTargetId !== null && (
                  <button
                    onClick={() => handleRemoveLink(linkTargetId)}
                    className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg text-sm mb-2 border border-red-500/20"
                  >
                    Remove link
                  </button>
                )}

                {!archetypeLoading && archetypeResults.map((archetype) => (
                  <button
                    key={archetype.id}
                    onClick={() => handleSelectArchetype(archetype)}
                    className="w-full text-left px-4 py-2.5 text-slate-200 hover:bg-amber-500/10 rounded-lg text-sm transition-colors"
                  >
                    {archetype.name}
                  </button>
                ))}

                {!archetypeLoading && archetypeSearchQuery && archetypeResults.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No archetypes found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1020] border-t border-yellow-600/40 shadow-[0_-4px_12px_-3px_rgba(0,0,0,0.3)] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-amber-300 text-sm font-medium">
              You have unsaved changes
            </p>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600/90 hover:bg-yellow-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 transition-colors shadow shadow-yellow-600/10"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      <InfoModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Tier List Help">
        <div className="space-y-5 text-sm">
          <div>
            <h3 className="text-amber-400 font-bold text-base mb-2">Scraping</h3>
            <p>Data comes from <strong>masterduelmeta.com/tier-list</strong>. The scraper fetches the page, parses deck names and tiers, and resolves card images from our storage (or YGOProDeck as fallback).</p>
            <p className="mt-1 text-slate-400">Auto-scrapes every 12h. Click <strong>"Scrape Now"</strong> to trigger manually.</p>
          </div>
          <div>
            <h3 className="text-amber-400 font-bold text-base mb-2">Source: Scraped vs Manual</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-blue-300">Scraped</strong>: Tier follows the meta (updates on each scrape). Image is never overwritten once set by admin.</li>
              <li><strong className="text-amber-300">Manual</strong>: Tier and image are <strong>frozen</strong>. The scraper skips this entry entirely. Use this when you want to lock a deck's position.</li>
              <li>Entries with a <strong>linked archetype</strong> always follow the meta regardless of source.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-amber-400 font-bold text-base mb-2">Linking to Archetype</h3>
            <p>Some deck names from MasterDuelMeta don't match our database (e.g., "HEROs" vs "HERO"). Click the <strong>"Link"</strong> button on a card to associate it with the correct archetype from your system. The public tier list will show the linked name and navigate to the correct guide page.</p>
            <p className="mt-1 text-slate-400">The link persists across scrapes — it's never overwritten.</p>
          </div>
          <div>
            <h3 className="text-amber-400 font-bold text-base mb-2">Deleting Entries</h3>
            <p>Click <strong>"X"</strong> on a card and save. The entry is soft-deleted (<code>is_active=0</code>). If the deck later falls out of the meta and then returns, it will <strong>auto-reactivate</strong>. If the deck is still in the meta, the soft-delete is respected and it won't reappear.</p>
          </div>
        </div>
      </InfoModal>

      {hasChanges && <div className="h-20" />}
    </div>
  );
};
