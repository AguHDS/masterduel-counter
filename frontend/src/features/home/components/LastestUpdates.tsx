import { Newspaper, ArrowRight } from "lucide-react";

const mockUpdates = [
  {
    id: 1,
    title: "Breaking Down The Current Tier List",
    date: "April 24, 2024",
    badge: "LZ3 S$",
    imageUrl: "/mock-images/tier-list.webp",
  },
  {
    id: 2,
    title: "Top 10 Budget Decks in the Meta",
    date: "April 23, 2024",
    badge: "LZ9 S$",
    imageUrl: "/mock-images/budget-decks.webp",
  },
  {
    id: 3,
    title: "Learn These Must-Know Combos",
    date: "April 24, 2024",
    badge: "LZ3 S$",
    imageUrl: "/mock-images/combos.webp",
  },
];

export const LatestUpdates = () => {
  const handleUpdateClick = (updateId: number) => {
    console.log("Update clicked:", updateId);
  };

  const handleViewAll = () => {
    console.log("View all updates");
  };

  return (
    <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border border-cyan-500/30">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(135deg, rgba(6, 182, 212, 0.6) 0%, rgba(14, 165, 233, 0.6) 50%, rgba(37, 99, 235, 0.6) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Newspaper className="w-7 h-7 text-cyan-400" />
            <h2 className="text-3xl font-bold text-white">Latest Updates</h2>
            <span className="text-sm text-cyan-400 font-semibold px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
              Coming soon!
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4 mb-6">
          {mockUpdates.map((update) => (
            <div
              key={update.id}
              onClick={() => handleUpdateClick(update.id)}
              className="flex items-start gap-4 p-3 rounded-lg bg-black/40 border border-cyan-500/30 hover:border-cyan-400/50 hover:bg-black/60 transition-all cursor-pointer"
            >
              <div className="flex-shrink-0">
                <div className="w-20 h-16 rounded-lg border-2 border-cyan-400/50 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {update.title.charAt(0)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-white font-bold text-base line-clamp-2 flex-1">
                    {update.title}
                  </h4>
                  <span className="text-xs text-cyan-400 font-semibold px-2 py-1 bg-cyan-500/20 rounded border border-cyan-500/30 whitespace-nowrap">
                    {update.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{update.date}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleViewAll}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 hover:border-cyan-400 rounded-lg text-white font-semibold transition-all"
        >
          View All Updates
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
