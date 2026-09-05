import { TierCard } from "./TierCard";
import type { TierListEntry } from "../types/tierList.types";

interface TierSectionProps {
  tier: number;
  entries: TierListEntry[];
  globalRank: Map<number, number>;
  isLast?: boolean;
}

const tierConfig: Record<number, {
  label: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  labelSize: string;
  containerWidth: string;
  gradientColor: string;
  sectionBorder: string;
}> = {
  0: {
    label: "T0",
    bgGradient: "from-sky-400/50 via-violet-400/35 to-violet-700/50",
    borderColor: "border-sky-400/30",
    textColor: "text-sky-200",
    labelSize: "text-lg sm:text-xl",
    containerWidth: "w-[28px] sm:w-[36px] md:w-[44px]",
    gradientColor: "rgba(125,196,248,0.07)",
    sectionBorder: "border-sky-400/20",
  },
  1: {
    label: "T1",
    bgGradient: "from-amber-400/50 via-amber-500/35 to-amber-700/50",
    borderColor: "border-amber-400/30",
    textColor: "text-amber-200",
    labelSize: "text-2xl sm:text-3xl",
    containerWidth: "w-[36px] sm:w-[52px] md:w-[64px]",
    gradientColor: "rgba(236, 223, 45, 0.08)",
    sectionBorder: "border-amber-400/25",
  },
   2: {
    label: "T2",
    bgGradient: "from-blue-500/30 via-blue-600/25 to-blue-800/35",
    borderColor: "border-blue-400/30",
    textColor: "text-blue-200",
    labelSize: "text-lg sm:text-xl",
    containerWidth: "w-[28px] sm:w-[36px] md:w-[44px]",
    gradientColor: "rgba(86, 149, 227, 0.03)",
    sectionBorder: "border-blue-400/20",
  },
  3: {
    label: "T3",
    bgGradient: "from-orange-900/70 via-orange-900/70 to-orange-900/70",
    borderColor: "border-orange-600/30",
    textColor: "text-orange-300",
    labelSize: "text-lg sm:text-xl",
    containerWidth: "w-[28px] sm:w-[36px] md:w-[44px]",
    gradientColor: "rgba(251,146,60,0.06)",
    sectionBorder: "border-orange-400/20",
  },
  4: {
    label: "T4",
    bgGradient: "from-gray-700/80 via-gray-800/90 to-gray-700/80",
    borderColor: "border-gray-400/25",
    textColor: "text-gray-300",
    labelSize: "text-lg sm:text-xl",
    containerWidth: "w-[28px] sm:w-[36px] md:w-[44px]",
    gradientColor: "rgba(156, 163, 175, 0.09)",
    sectionBorder: "border-gray-400/15",
  },
};

/** Section displaying the Tier number at the side */
export const TierSection = ({ tier, entries, globalRank, isLast = false }: TierSectionProps) => {
  const cfg = tierConfig[tier] ?? tierConfig[3];
  const isTierOne = tier === 1;

  if (entries.length === 0) return null;

  return (
    <div className={`flex border-b border-slate-500/25 last:border-b-0 relative ${isTierOne ? 'ml-0 sm:-ml-3 md:-ml-4 lg:-ml-5' : ''}`}>
      <div
        className={`${cfg.containerWidth} flex-shrink-0 flex flex-col items-center justify-center py-3 bg-gradient-to-b ${cfg.bgGradient} border-r ${cfg.borderColor} ${isTierOne ? 'rounded-tl-lg rounded-bl-sm' : ''} ${isLast ? 'rounded-bl-md' : ''}`}
      >
        <span className={`${cfg.labelSize} font-black italic tracking-tighter ${cfg.textColor}`}>
          {cfg.label}
        </span>
      </div>

      <div className={`flex-1 min-w-0 p-2 sm:p-2 relative overflow-hidden border ${cfg.sectionBorder} rounded-r-sm`}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: cfg.gradientColor,
          }}
        />
        <div className={`relative z-10 grid ${isTierOne ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8'} gap-2`}>
          {entries.map((entry) => (
            <TierCard key={entry.id} entry={entry} rank={globalRank.get(entry.id) ?? 0} isTierOne={isTierOne} />
          ))}
        </div>
      </div>
    </div>
  );
};
