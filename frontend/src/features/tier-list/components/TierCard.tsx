import { Link } from "react-router-dom";
import { Swords } from "lucide-react";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";
import { slugifySegment } from "@/lib/config/urlHelpers";
import type { TierListEntry } from "../types/tierList.types";

interface TierCardProps {
  entry: TierListEntry;
}

const tierColors: Record<number, { border: string; glow: string; bg: string }> = {
  0: { border: "border-none", glow: "", bg: "from-sky-950/50 via-violet-900/25 to-slate-950/80" },
  1: { border: "border-none", glow: "", bg: "from-amber-950/50 via-amber-900/20 to-slate-950/80" },
  2: { border: "border-none", glow: "", bg: "from-slate-800/40 via-slate-900/20 to-slate-950/80" },
  3: { border: "border-none", glow: "", bg: "from-orange-950/50 via-orange-900/20 to-slate-950/80" },
};

export const TierCard = ({ entry }: TierCardProps) => {
  const colors = tierColors[entry.tier] ?? tierColors[3];

  const displayName = entry.displayName || entry.deckName;
  const nameForSlug = entry.linkedArchetypeName || entry.displayName || entry.deckName;
  const targetPath = `/archetype/${slugifySegment(nameForSlug)}/deck-guides`;

  return (
    <Link
      to={targetPath}
      className={`relative rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] min-[501px]:shadow-none cursor-pointer group border ${colors.border} transition-all duration-300 bg-gradient-to-b ${colors.bg}`}
    >
      <div className="w-full aspect-[16/10] overflow-hidden relative">
        {entry.imageUrl ? (
          <img
            src={getOptimizedCardImageUrl(entry.imageUrl, { size: "full" })}
            alt={entry.deckName}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-800/60 flex items-center justify-center">
            <Swords className="w-8 h-8 text-slate-600" />
          </div>
        )}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-3 pt-2.5"
        style={{
          background: "linear-gradient(to top, rgba(8,10,25,0.80) 25%, rgba(8,10,20,0.0) 100%)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <p className="text-slate-100 font-bold text-sm truncate">
          {displayName}
        </p>
        <p className="text-[11px] mt-0.5 max-[500px]:hidden">
          <span className="text-amber-600">Counter: {entry.counterGuideCount}</span>
          <span className="text-slate-600">{" "}·{" "}</span>
          <span className="text-cyan-400">Deck: {entry.deckGuideCount}</span>
        </p>
      </div>
    </Link>
  );
};
