import { TrendingUp } from "lucide-react";
import { useGeneralStats } from "../hooks/useGeneralStats";
import { useNavigate } from "react-router-dom";
import backgroundImage from "@/assets/instanceEditorAndProfile_background.webp"

export const GeneralStats = () => {
  const { data, isLoading, error } = useGeneralStats(15);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border border-purple-500/30">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="relative z-10 p-8 flex flex-col h-full items-center justify-center">
          <div className="text-purple-300 text-lg">Loading stats...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border border-purple-500/30">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="relative z-10 p-8 flex flex-col h-full items-center justify-center">
          <div className="text-red-400 text-lg">Failed to load stats</div>
        </div>
      </div>
    );
  }

  const handleArchetypeClick = (archetypeId: number) => {
    navigate(`/archetype/${archetypeId}`);
  };

  return (
    <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border border-purple-500/30">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.6) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(168, 85, 247, 0.6) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-7 h-7 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">General Stats</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-black/40 border border-purple-500/30">
              <p className="text-sm text-purple-300 font-semibold mb-1">
                Registered Archetypes
              </p>
              <p className="text-2xl font-bold text-white">
                {data.totalArchetypes}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-blue-500/30">
              <p className="text-sm text-blue-300 font-semibold mb-1">
                Total Guides
              </p>
              <p className="text-2xl font-bold text-white">
                {data.totalGuides}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <h3 className="text-purple-300 text-lg font-semibold mb-4 uppercase tracking-wide">
            TOP 15 MOST DEMANDED
          </h3>
          <div className="space-y-2 flex-1 overflow-y-auto scrollbar-comments pr-2">
            {data.topArchetypes.map((archetype, index) => (
              <div
                key={archetype.id}
                onClick={() => handleArchetypeClick(archetype.id)}
                className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-purple-500/20 hover:border-purple-400/40 hover:bg-black/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                      index < 3
                        ? "bg-purple-500/20 text-yellow-400"
                        : "bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-white font-medium">
                    {archetype.name}
                  </span>
                </div>
                <span className="text-purple-300 font-semibold">
                  {archetype.guideCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
