import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTierList, useTriggerScrape, useTierListConfig } from "../hooks/useTierList";
import { TierSection } from "../components/TierSection";
import { Navbar } from "@/layouts/navbar/components/Navbar";
import { useAuth } from "@/features/auth";
import { RefreshCw, ChevronDown } from "lucide-react";
import MDCBackground from "@/assets/HomeAllPages_Background2.webp";

type TierListFormat = "masterduel" | "tcg" | "ocg";

const FORMATS: { key: TierListFormat; label: string }[] = [
  { key: "masterduel", label: "Master Duel" },
  { key: "tcg", label: "TCG" },
  { key: "ocg", label: "OCG" },
];

export const TierListPage = () => {
  const [format, setFormat] = useState<TierListFormat>("masterduel");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: entries = [], isLoading, isError } = useTierList(format);
  const { data: config } = useTierListConfig(format);
  const { user } = useAuth();
  const triggerScrape = useTriggerScrape();
  const isAdmin = user?.role === "admin";

  const tiers = [...new Set(entries.map((e) => e.tier))].sort((a, b) => a - b);
  const globalRank = new Map(entries.map((e, i) => [e.id, i + 1]));
  const currentLabel = FORMATS.find((f) => f.key === format)?.label ?? "Master Duel";

  const monthLabel = config?.lastScrapedAt
    ? new Date(config.lastScrapedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()
    : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScrape = () => {
    triggerScrape.mutate();
  };

  const scrapeError = triggerScrape.isError
    ? (triggerScrape.error as Error)?.message || "Scrape failed"
    : null;

  return (
    <>
      <Helmet>
        <title>Tier List - Masterduel Counter</title>
        <meta name="description" content="Yu-Gi-Oh! meta deck tier list for Master Duel, TCG and OCG. See the top competitive decks ranked by tournament performance. Updated regularly." />
        <meta name="keywords" content="Yu-Gi-Oh tier list, meta decks, Master Duel tier list, TCG tier list, OCG tier list, competitive decks, tournament decks" />
        <meta property="og:title" content="Tier List - Masterduel Counter" />
        <meta property="og:description" content="Meta deck tier list for Master Duel, TCG and OCG. Top competitive decks ranked by tournament performance." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tier List - Masterduel Counter" />
        <meta name="twitter:description" content="Meta deck tier list for Master Duel, TCG and OCG." />
        <link rel="canonical" href="https://masterduelcounter.com/tierlist" />
      </Helmet>
      <Navbar />
      <div className="min-h-screen bg-black/70">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${MDCBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-black/45 pointer-events-none" />

          <div className="relative z-10 max-w-[1450px] mx-auto py-6">
            <div className="px-4 sm:px-6 lg:px-8 mb-8">
              <div className="flex items-center gap-4 mb-1">
                <div className="flex-1 hidden sm:block h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 group"
                  >
                    <h1 className="text-3xl sm:text-4xl font-black tracking-[0.15em] uppercase bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent whitespace-nowrap">
                      {currentLabel}
                    </h1>
                    <ChevronDown
                      className={`w-5 h-5 text-amber-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div
                    className={`absolute top-full mt-2 left-0 sm:left-auto sm:right-[-7rem] z-50 min-w-[160px] bg-[#1f1a24] border border-amber-500/30 rounded-lg shadow-xl shadow-black/50 overflow-hidden transition-all duration-200 origin-top ${
                      dropdownOpen
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-95 pointer-events-none"
                    }`}
                  >
                    {FORMATS.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => {
                          setFormat(f.key);
                          setDropdownOpen(false);
                        }}
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
                <div className="flex-1 hidden sm:block h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              </div>

              {monthLabel && (
                <p className={`text-yellow-500 font-bold text-md text-left sm:text-center ${format === "masterduel" ? "sm:-ml-4" : "sm:-ml-8"}`}>{monthLabel}</p>
              )}
            </div>

            <div className="px-2 sm:px-3 lg:px-5">

            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400" />
              </div>
            )}

            {isError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                <p className="text-red-300">Failed to load tier list data.</p>
              </div>
            )}

            {!isLoading && !isError && entries.length === 0 && (
              <div className="bg-slate-800/40 border border-slate-600/30 rounded-lg p-12 text-center">
                {format === "masterduel" ? (
                  <>
                    <p className="text-slate-400 text-lg">No tier list data available yet.</p>
                    {scrapeError && (
                      <p className="text-red-400 text-sm mt-2">Error: {scrapeError}</p>
                    )}
                    {isAdmin && (
                      <button
                        onClick={handleScrape}
                        disabled={triggerScrape.isPending}
                        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                      >
                        <RefreshCw className={`w-4 h-4 ${triggerScrape.isPending ? "animate-spin" : ""}`} />
                        {triggerScrape.isPending ? "Scraping..." : "Scrape Now"}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-slate-400 text-lg">
                    No data available yet for {currentLabel}.
                  </p>
                )}
              </div>
            )}

            {!isLoading && !isError && entries.length > 0 && (
              <div className="rounded-xl bg-slate-800/15 flex flex-col gap-2">
                {tiers.map((tier, index) => {
                  const tierEntries = entries.filter((e) => e.tier === tier && e.isActive);
                  return <TierSection key={tier} tier={tier} entries={tierEntries} globalRank={globalRank} isLast={index === tiers.length - 1} />;
                })}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
