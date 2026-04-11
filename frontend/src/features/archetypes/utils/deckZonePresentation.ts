export type DeckDisplayZone = "main" | "extra" | "side";

export interface DeckZoneStyleConfig {
  header: string;
  badge: string;
  panel: string;
  grid: string;
  cardFrame: string;
  addButton: string;
  label: string;
}

export const DECK_ZONE_LIMITS: Record<DeckDisplayZone, number> = {
  main: 60,
  extra: 15,
  side: 20,
};

export const DECK_ZONE_STYLES: Record<DeckDisplayZone, DeckZoneStyleConfig> = {
  main: {
    header:
      "border-sky-400/18 bg-gradient-to-r from-blue-800/25 via-blue-900/60 to-transparent",
    badge: "border-sky-400/20 bg-sky-500/10 text-sky-200",
    panel:
      "border-sky-400/12 bg-gradient-to-br from-[#08111f] via-[#111a2f] to-[#120f23]",
    grid: "border-sky-500/18 bg-sky-950/18",
    cardFrame: "border-sky-400/28 group-hover/card:border-sky-300/60",
    addButton:
      "border-sky-400/30 bg-sky-500/10 text-sky-200 hover:bg-sky-500/16",
    label: "text-sky-200",
  },
  extra: {
    header:
      "border-violet-400/18 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/25 to-transparent",
    badge: "border-violet-400/20 bg-violet-500/10 text-violet-200",
    panel:
      "border-violet-400/12 bg-gradient-to-br from-[#0a1020] via-[#171331] to-[#180d27]",
    grid: "border-violet-500/18 bg-violet-950/18",
    cardFrame: "border-violet-400/28 group-hover/card:border-violet-300/60",
    addButton:
      "border-violet-400/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/16",
    label: "text-violet-200",
  },
  side: {
    header:
      "border-cyan-400/18 bg-gradient-to-r from-yellow-500/10 via-yellow-800/25 to-transparent",
    badge: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
    panel:
      "border-cyan-400/12 bg-gradient-to-br from-yellow-800/20 via-yellow-950/40 to-yellow-800/20",
    grid: "border-cyan-500/18 bg-cyan-950/18",
    cardFrame: "border-cyan-400/28 group-hover/card:border-yellow-300/60",
    addButton:
      "border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/16",
    label: "text-cyan-200",
  },
};

export const getDeckZoneLabel = (zone: DeckDisplayZone): string => {
  switch (zone) {
    case "main":
      return "Main Deck";
    case "extra":
      return "Extra Deck";
    case "side":
      return "Side Deck";
    default:
      return "Deck";
  }
};