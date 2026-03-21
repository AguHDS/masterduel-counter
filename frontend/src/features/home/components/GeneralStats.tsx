import { TrendingUp } from "lucide-react";
import { useGeneralStats } from "../hooks/useGeneralStats";
import { useNavigate } from "react-router-dom";

export const GeneralStats = () => {
  const { data, isLoading, error } = useGeneralStats(15);
  const navigate = useNavigate();

  // MOCK ONLY FOR DECK GUIDES
  const mockDeckStats = {
    totalDeckGuides: 142,
    topDecks: [
      { id: 1, name: "Branded", guideCount: 32 },
      { id: 2, name: "Rescue-Ace", guideCount: 28 },
      { id: 3, name: "Labrynth", guideCount: 21 },
      { id: 4, name: "Snake-Eyes", guideCount: 19 },
      { id: 5, name: "Kashtira", guideCount: 17 },
      { id: 6, name: "Purrely", guideCount: 14 },
      { id: 7, name: "Spright", guideCount: 12 },
      { id: 8, name: "Mathmech", guideCount: 11 },
      { id: 9, name: "Dragon Link", guideCount: 9 },
      { id: 10, name: "Runick", guideCount: 8 },
      { id: 11, name: "Floowandereeze", guideCount: 7 },
      { id: 12, name: "Swordsoul", guideCount: 6 },
      { id: 13, name: "Tearlaments", guideCount: 5 },
      { id: 14, name: "Tri-Brigade", guideCount: 4 },
      { id: 15, name: "Salamangreat", guideCount: 3 },
    ],
  };

  if (isLoading) {
    return (
      <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border border-purple-500/30">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 opacity-90" />

        <div className="relative z-10 p-8 flex items-center justify-center h-full">
          <div className="text-purple-300 text-lg">Loading stats...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border border-purple-500/30">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 opacity-90" />

        <div className="relative z-10 p-8 flex items-center justify-center h-full">
          <div className="text-red-400 text-lg">Failed to load stats</div>
        </div>
      </div>
    );
  }

  const handleArchetypeClick = (archetypeId: number) => {
    navigate(`/archetype/${archetypeId}`);
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-30" />

      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/70" />

      <div className="relative z-10 flex flex-col h-full p-8 min-h-0">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-7 h-7 text-orange-400" />
          <h2 className="text-3xl font-bold text-white">General Stats</h2>
        </div>

        <div className="grid grid-cols-2 divide-x divide-slate-700 flex-1 min-h-0">
          {/* COUNTER GUIDES (ROJO / NARANJA / AMARILLO) */}
          <div className="flex flex-col h-full pr-6 min-h-0">
            <h3 className="text-xl font-semibold text-orange-400 mb-4">
              Counter Guides
            </h3>

            <div className="mb-4">
              <div className="p-3 rounded-lg bg-black/40 border border-red-500/30">
                <p className="text-sm text-orange-300 font-semibold mb-1">
                  Total Counter Guides
                </p>
                <p className="text-2xl font-bold text-white">
                  {data.totalGuides}
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-comments pr-2 space-y-2">
              {data.topArchetypes.map((archetype, index) => (
                <div
                  key={archetype.id}
                  onClick={() => handleArchetypeClick(archetype.id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-red-500/20 hover:border-orange-400/50 hover:bg-black/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                        index < 3
                          ? "bg-orange-500/20 text-yellow-300"
                          : "bg-red-500/20 text-orange-300"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span className="text-white font-medium">
                      {archetype.name}
                    </span>
                  </div>

                  <span className="text-orange-300 font-semibold">
                    {archetype.guideCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DECK GUIDES (AZUL / CELESTE / MORADO) */}
          <div className="flex flex-col h-full pl-6 min-h-0">
            <h3 className="text-xl font-semibold text-blue-300 mb-4">
              Deck Guides
            </h3>

            <div className="mb-4">
              <div className="p-3 rounded-lg bg-black/40 border border-blue-500/30">
                <p className="text-sm text-sky-300 font-semibold mb-1">
                  Total Deck Guides
                </p>
                <p className="text-2xl font-bold text-white">
                  {mockDeckStats.totalDeckGuides}
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-comments pr-2 space-y-2">
              {mockDeckStats.topDecks.map((deck, index) => (
                <div
                  key={deck.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-blue-500/20 hover:border-purple-400/40 hover:bg-black/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                        index < 3
                          ? "bg-blue-500/20 text-sky-200"
                          : "bg-purple-500/20 text-blue-300"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span className="text-white font-medium">{deck.name}</span>
                  </div>

                  <span className="text-sky-300 font-semibold">
                    {deck.guideCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
