import { useTierList, useTriggerScrape } from "../hooks/useTierList";
import { TierSection } from "../components/TierSection";
import { Navbar } from "@/layouts/navbar/components/Navbar";
import { useAuth } from "@/features/auth";
import { RefreshCw } from "lucide-react";
import MDCBackground from "@/assets/HomeAllPages_Background2.webp";

/** Page to display Tierlist */
export const TierListPage = () => {
  const { data: entries = [], isLoading, isError } = useTierList("masterduel");
  const { user } = useAuth();
  const triggerScrape = useTriggerScrape();
  const isAdmin = user?.role === "admin";

  const tier1 = entries.filter((e) => e.tier === 1 && e.isActive);
  const tier2 = entries.filter((e) => e.tier === 2 && e.isActive);
  const tier3 = entries.filter((e) => e.tier === 3 && e.isActive);

  const handleScrape = () => {
    triggerScrape.mutate();
  };

  const scrapeError = triggerScrape.isError
    ? (triggerScrape.error as Error)?.message || "Scrape failed"
    : null;

  return (
    <>
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

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-1">
                <div className="flex-1 hidden sm:block h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                <h1 className="text-3xl sm:text-4xl font-black tracking-[0.15em] uppercase bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent whitespace-nowrap">
                  Tier List
                </h1>
                <div className="flex-1 hidden sm:block h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              </div>
            </div>

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
              </div>
            )}

            {!isLoading && !isError && entries.length > 0 && (
              <div className="border border-slate-500/20 rounded-xl overflow-hidden bg-black/30">
                <TierSection tier={1} entries={tier1} />
                <TierSection tier={2} entries={tier2} />
                <TierSection tier={3} entries={tier3} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
