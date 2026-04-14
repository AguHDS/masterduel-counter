/** Returns the Tailwind text-color class for a given rank position */
export const getRankColor = (rank: number): string => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-slate-300";
  if (rank === 3) return "text-amber-500";
  return "text-gray-500";
};

/** Returns the Tailwind background-gradient class for a given rank row */
export const getRankRowBg = (rank: number): string => {
  if (rank === 1)
    return "bg-gradient-to-r from-yellow-500/12 via-yellow-600/5 to-transparent";
  if (rank === 2)
    return "bg-gradient-to-r from-slate-400/10 via-slate-500/5 to-transparent";
  if (rank === 3)
    return "bg-gradient-to-r from-amber-600/10 via-amber-700/5 to-transparent";
  return "";
};
