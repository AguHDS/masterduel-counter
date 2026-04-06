import { TrendingUp } from "lucide-react";
import { useGeneralStats } from "../hooks/useGeneralStats";
import { useNavigate } from "react-router-dom";

/** Displays quantity of Counter Guides and Deck Guides */
export const GeneralStats = () => {
  const { data: counterData, isLoading: counterLoading, error: counterError } = useGeneralStats(15, 'COUNTER');
  const { data: deckData, isLoading: deckLoading, error: deckError } = useGeneralStats(15, 'DECK');
  const navigate = useNavigate();

  const isLoading = counterLoading || deckLoading;
  const error = counterError || deckError;

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

  if (error || !counterData || !deckData) {
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

      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-indigo-950/40 to-indigo-950/50" />

      <div className="relative z-10 flex flex-col h-full p-8 min-h-0 ">
        <div className="flex items-center gap-3 mb-4">
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
                  {counterData.totalGuides}
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-homeAllPages pr-2 space-y-2">
              {counterData.topArchetypes.map((archetype, index) => (
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
                          : "bg-purple-500/20 text-blue-300"
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
                  {deckData.totalGuides}
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-homeAllPages pr-2 space-y-2">
              {deckData.topArchetypes.map((deck, index) => (
                <div
                  key={deck.id}
                  onClick={() => handleArchetypeClick(deck.id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-blue-500/20 hover:border-purple-400/40 hover:bg-black/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                        index < 3
                          ? "bg-orange-500/20 text-yellow-300"
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
