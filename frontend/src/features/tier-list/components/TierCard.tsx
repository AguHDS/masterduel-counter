import { useNavigate } from "react-router-dom";
import { Swords } from "lucide-react";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";
import type { TierListEntry } from "../types/tierList.types";

interface TierCardProps {
  entry: TierListEntry;
}

const tierColors: Record<number, { border: string; glow: string; badge: string }> = {
  1: {
    border: "border-amber-500/40 hover:border-amber-400/70",
    glow: "hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  2: {
    border: "border-slate-400/40 hover:border-slate-300/60",
    glow: "hover:shadow-[0_0_20px_-5px_rgba(148,163,184,0.35)]",
    badge: "bg-slate-400/20 text-slate-300 border-slate-400/40",
  },
  3: {
    border: "border-orange-700/40 hover:border-orange-600/60",
    glow: "hover:shadow-[0_0_20px_-5px_rgba(194,65,12,0.35)]",
    badge: "bg-orange-700/20 text-orange-300 border-orange-700/40",
  },
};

export const TierCard = ({ entry }: TierCardProps) => {
  const navigate = useNavigate();
  const colors = tierColors[entry.tier] ?? tierColors[3];

  const handleClick = () => {
    const slug = entry.deckName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/archetype/${slug}/counter-guides`);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-lg overflow-hidden shadow-lg shadow-black/50 cursor-pointer group border ${colors.border} transition-all duration-300 ${colors.glow}`}
      style={{ background: "linear-gradient(to bottom, #111827, #0b0d14)" }}
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
        className="absolute bottom-0 left-0 right-0 px-3 py-2.5"
        style={{
          background: "linear-gradient(to top, rgba(8,10,25,0.94) 50%, rgba(8,10,20,0.0) 100%)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <p className="text-slate-100 font-bold text-sm truncate">
          {entry.deckName}
        </p>
      </div>
    </div>
  );
};
