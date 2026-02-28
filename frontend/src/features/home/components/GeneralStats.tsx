import { TrendingUp, Users } from "lucide-react";

interface GeneralStatsProps {
  totalArchetypes?: number;
  totalGuides?: number;
  topArchetypes?: Array<{ name: string; count: number }>;
}

export const GeneralStats = ({
  totalArchetypes = 156,
  totalGuides = 342,
  topArchetypes = [
    { name: "Vanquish Soul", count: 12 },
    { name: "Kashtira", count: 10 },
    { name: "Purrely", count: 8 },
    { name: "Labrynth", count: 7 },
    { name: "Tearlaments", count: 6 },
    { name: "Spright", count: 5 },
    { name: "Branded", count: 5 },
    { name: "Runick", count: 4 },
    { name: "Live☆Twin", count: 4 },
    { name: "Mathmech", count: 3 },
  ],
}: GeneralStatsProps) => {
  return (
    <div className="relative flex flex-col h-full">
      <div
        className="absolute inset-0 rounded-[26px] opacity-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(168, 85, 247, 0.3) 100%)",
        }}
      />

      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-300" />
          </div>
          <h3 className="text-2xl font-bold text-white">General Stats</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-black/40 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-blue-300 font-semibold">Registered Archetypes</p>
            </div>
            <p className="text-3xl font-bold text-white">{totalArchetypes}</p>
          </div>

          <div className="p-4 rounded-lg bg-black/40 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <p className="text-sm text-purple-300 font-semibold">Guides</p>
            </div>
            <p className="text-3xl font-bold text-white">{totalGuides}</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <h4 className="text-sm font-semibold text-blue-300 mb-3 uppercase tracking-wide">
            Top 10 Most Demanded
          </h4>
          <div className="space-y-2 flex-1 overflow-y-auto scrollbar-comments pr-2">
            {topArchetypes.map((archetype, index) => (
              <div
                key={archetype.name}
                className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-blue-500/20 hover:border-blue-400/40 hover:bg-black/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index < 3
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-black"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-white font-medium">{archetype.name}</span>
                </div>
                <span className="text-blue-300 font-semibold">{archetype.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
