import { Link } from "react-router-dom";
import { Swords } from "lucide-react";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";
import { slugifySegment } from "@/lib/config/urlHelpers";
import type { TierListEntry } from "../types/tierList.types";

interface TierCardProps {
  entry: TierListEntry;
  rank: number;
  isTierOne?: boolean;
}

const tierColors: Record<number, { border: string; bg: string; rankGradient: string }> = {
  0: { border: "border-red-500/60", bg: "from-red-950/60 via-red-900/25 to-slate-950/30", rankGradient: "from-red-300 via-red-500 to-red-600" },
  1: { border: "border-yellow-700/40", bg: "from-amber-400 via-sky-400/90 to-amber-200", rankGradient: "from-yellow-200 via-amber-400 to-yellow-300" },
  2: { border: "border-sky-700/50", bg: "from-blue-950/60 via-blue-300 to-blue-800/70", rankGradient: "from-blue-300 via-sky-200 to-blue-400" },
  3: { border: "border-orange-400/30", bg: "from-orange-950/50 via-sky-100/60 to-sky-250/70", rankGradient: "from-orange-500 via-amber-400 to-orange-500" },
  4: { border: "border-slate-500/70", bg: "from-slate-950 via-slate-400/40 to-slate-950", rankGradient: "from-slate-300 via-gray-200 to-slate-400" },
};

export const TierCard = ({ entry, rank, isTierOne = false }: TierCardProps) => {
  const colors = tierColors[entry.tier] ?? tierColors[3];

  const displayName = entry.displayName || entry.deckName;
  const nameForSlug = entry.linkedArchetypeName || entry.displayName || entry.deckName;
  const guideSegment = entry.deckGuideCount > 0 || entry.counterGuideCount === 0 ? 'deck-guides' : 'counter-guides';
  const targetPath = `/archetype/${slugifySegment(nameForSlug)}/${guideSegment}`;

  return (
    <Link
      to={targetPath}
      className={`relative overflow-hidden min-[501px]:shadow-none cursor-pointer group border-t border-l border-r ${colors.border} bg-gradient-to-b ${colors.bg} rounded-bl-[5px] rounded-br-[5px]`}
    >
      <div className={`w-full ${isTierOne ? 'aspect-[4/3]' : 'aspect-[3/2]'} overflow-hidden relative`}>
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
        <span className={`absolute font-mono bottom-1 right-1 z-10 bg-gradient-to-r ${colors.rankGradient} bg-clip-text text-transparent font-black leading-none pointer-events-none select-none drop-shadow-[0_0_4px_rgba(251,191,36,0.6)] ${isTierOne ? 'text-sm' : entry.tier === 2 ? 'text-xs' : 'text-[10px]'}`}>
          #{rank}
        </span>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-2 pt-2"
        style={{
          background: entry.tier === 4
            ? "linear-gradient(to top, rgba(8,10,25,0.70) 24%, rgba(8,10,20,0.0) 100%)"
            : "linear-gradient(to top, rgba(8,10,25,0.80) 25%, rgba(8,10,20,0.0) 100%)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <p className={`text-slate-100 truncate ${isTierOne ? 'text-sm font-bold' : entry.tier === 4 ? 'text-[9px] font-bold tracking-wide' : entry.tier === 3 ? 'text-[10px] font-bold tracking-wide' : entry.tier === 2 ? 'text-[11px] font-bold tracking-wide' : 'text-sm font-bold tracking-wide'}`}>
          {displayName}
        </p>
        <p className={`${isTierOne ? 'text-[9px]' : entry.tier === 4 ? 'text-[7px]' : entry.tier === 3 ? 'text-[8px]' : entry.tier === 2 ? 'text-[9px]' : 'text-[9px]'} mt-0.5 max-[500px]:hidden`}>
          <span className="text-amber-600">Counter: {entry.counterGuideCount}</span>
          <span className="text-slate-600">{" "}·{" "}</span>
          <span className="text-cyan-400">Deck: {entry.deckGuideCount}</span>
        </p>
      </div>
    </Link>
  );
};
