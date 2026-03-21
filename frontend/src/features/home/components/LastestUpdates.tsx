import { ArrowRight } from "lucide-react";
import banlist_preview_left from "@/assets/home-rework/LastUpdatesList/Banlist_Preview.webp";
import banlist_preview_right from "@/assets/home-rework/LastUpdatesList/masterduel_background.webp";

const mockUpdates = [
  {
    id: 1,
    title: "Duelist Cup: Stage 2 Results and Top Decks",
    date: "April 24, 2026",
    image: banlist_preview_right,
    alt: "Duelist Cup",
  },
  {
    id: 2,
    title: "April 2026 Banlist: Forbidden & Limited Updates",
    date: "April 23, 2026",
    image: banlist_preview_left,
    alt: "Banlist Preview",
  },
  {
    id: 3,
    title: "Balance Patch Notes: Card Adjustments",
    date: "April 24, 2026",
    image: banlist_preview_right,
    alt: "Master Duel Background",
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
    <div className="relative w-full flex flex-col h-full overflow-hidden border border-slate-600/40">
      {/* background image */}
      <div className="absolute inset-0 bg-cover bg-center opacity-30" />

      {/* gradient background (same as GeneralStats) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-90" />

      {/* Overlay más sutil para "Coming Soon!" */}
      <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
        <h2 className="text-5xl font-light text-white/80 tracking-[0.2em]">
          COMING SOON
        </h2>
      </div>

      {/* Contenido original ligeramente oscurecido */}
      <div className="relative z-10 flex flex-col h-full p-6 opacity-40">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-white">Latest Updates</h2>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {mockUpdates.map((update) => (
            <div
              key={update.id}
              onClick={() => handleUpdateClick(update.id)}
              className="flex items-start gap-4 p-3 rounded-lg bg-black/40 border border-slate-700 hover:border-slate-500 hover:bg-black/60 transition-all cursor-pointer"
            >
              <div className="flex-shrink-0">
                <img
                  src={update.image}
                  alt={update.alt}
                  className="w-20 h-14 rounded-lg border border-slate-500 object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2 mb-1">
                  <h4 className="text-white font-semibold text-base line-clamp-2">
                    {update.title}
                  </h4>
                </div>

                <p className="text-sm text-gray-400">{update.date}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleViewAll}
          className="mt-4 flex items-center justify-center gap-2 text-slate-300 hover:text-white text-lg transition-colors"
        >
          View All Updates
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
