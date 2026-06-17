import { TierCard } from "./TierCard";
import type { TierListEntry } from "../types/tierList.types";

interface TierSectionProps {
  tier: number;
  entries: TierListEntry[];
}

const tierConfig: Record<number, {
  label: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
}> = {
  0: {
    label: "T0",
    bgGradient: "from-sky-400/50 via-violet-400/35 to-violet-700/50",
    borderColor: "border-sky-400/30",
    textColor: "text-sky-200",
  },
  1: {
    label: "T1",
    bgGradient: "from-amber-400/50 via-amber-500/35 to-amber-700/50",
    borderColor: "border-amber-400/30",
    textColor: "text-amber-200",
  },
  2: {
    label: "T2",
    bgGradient: "from-slate-500/30 via-slate-600/25 to-slate-800/35",
    borderColor: "border-slate-400/15",
    textColor: "text-slate-300",
  },
  3: {
    label: "T3",
    bgGradient: "from-orange-700/35 via-orange-800/30 to-orange-950/40",
    borderColor: "border-orange-600/20",
    textColor: "text-orange-300",
  },
};

/** Section displaying the Tier number at the side */
export const TierSection = ({ tier, entries }: TierSectionProps) => {
  const cfg = tierConfig[tier] ?? tierConfig[3];

  if (entries.length === 0) return null;

  return (
    <div className="flex border-b border-slate-500/15 last:border-b-0">
      <div
        className={`w-[60px] sm:w-[72px] flex-shrink-0 flex flex-col items-center justify-center py-4 bg-gradient-to-b ${cfg.bgGradient} border-r ${cfg.borderColor}`}
      >
        <span className={`text-2xl sm:text-3xl font-black italic tracking-tighter ${cfg.textColor} drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]`}>
          {cfg.label}
        </span>
      </div>

      <div className="flex-1 min-w-0 p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {entries.map((entry) => (
            <TierCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
};
