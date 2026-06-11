import { TrendingUp } from "lucide-react";
import { useGeneralStats } from "../hooks/useGeneralStats";
import { useNavigate } from "react-router-dom";
import { buildArchetypePath } from "@/lib/config/urlHelpers";

/** Displays quantity of Counter Guides and Deck Guides */
export const GeneralStats = () => {
  const { data: counterData, isLoading: counterLoading, error: counterError } = useGeneralStats(15, 'COUNTER');
  const { data: deckData, isLoading: deckLoading, error: deckError } = useGeneralStats(15, 'DECK');
  const navigate = useNavigate();

  const isLoading = counterLoading || deckLoading;
  const error = counterError || deckError;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-[#c2901c]" />
          <h2 className="text-white font-semibold text-base">General Stats</h2>
        </div>
        <div className="bg-[#1c1f2e] rounded-xl border border-[#c2901c]/20 flex-1 flex items-center justify-center">
          <div className="text-[#c2901c]/60 text-sm">Loading stats...</div>
        </div>
      </div>
    );
  }

  if (error || !counterData || !deckData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-[#c2901c]" />
          <h2 className="text-white font-semibold text-base">General Stats</h2>
        </div>
        <div className="bg-[#1c1f2e] rounded-xl border border-[#c2901c]/20 flex-1 flex items-center justify-center">
          <div className="text-red-400 text-sm">Failed to load stats</div>
        </div>
      </div>
    );
  }

  const handleArchetypeClick = (
    archetypeId: number,
    archetypeName: string,
    selectedType: "counter" | "deck",
  ) => {
    navigate(
      buildArchetypePath({
        archetypeId,
        archetypeName,
        guideType: selectedType.toUpperCase(),
      }),
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-3">
        <TrendingUp className="h-5 w-5 text-[#c2901c]" />
        <h2 className="text-white font-semibold text-lg">General Stats</h2>
      </div>

      <div className="bg-[#1c1f2e] rounded-xl border border-[#c2901c]/20 overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="grid grid-cols-2 max-[650px]:grid-cols-1 divide-x max-[650px]:divide-x-0 divide-[#c2901c]/10 max-[650px]:divide-y max-[650px]:divide-[#c2901c]/10 flex-1 min-h-0">
          {/* COUNTER GUIDES */}
          <div className="flex flex-col min-h-0">
            <div className="px-4 py-2.5 border-b border-[#c2901c]/10">
              <span className="text-xs font-semibold text-[#c2901c]">
                Counter Guides <span className="max-[650px]:inline hidden font-normal text-[#c2901c]/60">({counterData.totalGuides})</span>
              </span>
            </div>

            <div className="flex flex-col flex-1 min-h-0 p-4 max-[650px]:p-3">
              <div className="mb-3 max-[650px]:hidden">
                <div className="p-3 rounded-lg bg-black/30 border border-[#c2901c]/20">
                  <p className="text-xs text-amber-500 font-semibold mb-1">
                    Total Counter Guides
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {counterData.totalGuides}
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-homeAllPages pr-1 space-y-1.5">
                {counterData.topArchetypes.map((archetype, index) => (
                  <div
                    key={archetype.id}
                    onClick={() =>
                      handleArchetypeClick(archetype.id, archetype.name, "counter")
                    }
                    className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 border border-[#c2901c]/15 hover:border-[#c2901c]/40 hover:bg-black/40 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index < 3
                            ? "bg-[#c2901c]/20 text-[#c2901c]"
                            : "bg-slate-700/50 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <span className="text-white text-sm font-medium">
                        {archetype.name}
                      </span>
                    </div>

                    <span className="text-[#c2901c] text-sm font-semibold">
                      {archetype.guideCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DECK GUIDES */}
          <div className="flex flex-col min-h-0">
            <div className="px-4 py-2.5 border-b border-[#c2901c]/10">
              <span className="text-xs font-semibold text-purple-400">
                Deck Guides <span className="max-[650px]:inline hidden font-normal text-purple-400/60">({deckData.totalGuides})</span>
              </span>
            </div>

            <div className="flex flex-col flex-1 min-h-0 p-4 max-[650px]:p-3">
              <div className="mb-3 max-[650px]:hidden">
                <div className="p-3 rounded-lg bg-black/30 border border-purple-500/20">
                  <p className="text-xs text-purple-400/90 font-semibold mb-1">
                    Total Deck Guides
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {deckData.totalGuides}
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-homeAllPages pr-1 space-y-1.5">
                {deckData.topArchetypes.map((deck, index) => (
                  <div
                    key={deck.id}
                    onClick={() =>
                      handleArchetypeClick(deck.id, deck.name, "deck")
                    }
                    className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 border border-purple-500/15 hover:border-purple-400/40 hover:bg-black/40 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index < 3
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-slate-700/50 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <span className="text-white text-sm font-medium">{deck.name}</span>
                    </div>

                    <span className="text-purple-400 text-sm font-semibold">
                      {deck.guideCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
