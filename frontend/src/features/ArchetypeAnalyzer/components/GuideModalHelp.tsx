import { InfoModal } from "@/shared/components/info/components/InfoModal";

interface GuideModalHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModalHelp = ({ isOpen, onClose }: GuideModalHelpProps) => {
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      title="How to Correctly Create a Guide"
    >
      <div className="space-y-6 text-gray-200">
        {/* Phase 1: Header Information */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2 drop-shadow-md">
            <span className="bg-blue-500/40 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-400/50">
              1
            </span>
            Header Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 transition-shadow">
              <div className="aspect-video bg-slate-800/80 rounded-lg mb-2 flex items-center justify-center text-slate-500 text-sm border border-slate-700/50">
                [Header Card Image]
              </div>
              <p className="text-sm">
                <span className="text-blue-300 font-semibold">
                  Header Card:
                </span>{" "}
                Select a card that best represents the archetype's main
                strategy.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 transition-shadow">
              <div className="aspect-video bg-slate-800/80 rounded-lg mb-2 flex items-center justify-center text-slate-500 text-sm border border-slate-700/50">
                [Title & General Tip]
              </div>
              <p className="text-sm">
                <span className="text-blue-300 font-semibold">
                  Title & General Tip:
                </span>{" "}
                Give your guide a clear title and add a brief general tip.
              </p>
            </div>
          </div>
        </section>

        {/* Phase 2: Card Pairs */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2 drop-shadow-md">
            <span className="bg-blue-500/40 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-400/50">
              2
            </span>
            Card Pairs - Core Combos
          </h3>
          <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 transition-shadow">
            <div className="aspect-video bg-slate-800/80 rounded-lg mb-2 flex items-center justify-center text-slate-500 text-sm border border-slate-700/50">
              [Card Pair Example]
            </div>
            <p className="text-sm mb-2">
              <span className="text-blue-300 font-semibold">
                Creating Card Pairs:
              </span>{" "}
              Each pair represents a key combo.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-xs">
              <li>
                <span className="text-blue-300 font-medium">Top Cards:</span>{" "}
                Starting point of the combo
              </li>
              <li>
                <span className="text-blue-300 font-medium">Bottom Cards:</span>{" "}
                Result or follow-up cards
              </li>
              <li>
                <span className="text-blue-300 font-medium">
                  Effectiveness:
                </span>{" "}
                Rate impact (Low/Medium/High)
              </li>
              <li>
                <span className="text-blue-300 font-medium">Comment:</span>{" "}
                Explain the combo details
              </li>
            </ul>
          </div>
        </section>

        {/* Phase 3: Recommended Deck */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2 drop-shadow-md">
            <span className="bg-blue-500/40 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-400/50">
              3
            </span>
            Recommended Deck
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 transition-shadow">
              <div className="aspect-video bg-slate-800/80 rounded-lg mb-2 flex items-center justify-center text-slate-500 text-sm border border-slate-700/50">
                [Main Deck]
              </div>
              <p className="text-sm">
                <span className="text-blue-300 font-semibold">Main Deck:</span>{" "}
                Include essential monsters, spells, and traps.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 transition-shadow">
              <div className="aspect-video bg-slate-800/80 rounded-lg mb-2 flex items-center justify-center text-slate-500 text-sm border border-slate-700/50">
                [Extra Deck]
              </div>
              <p className="text-sm">
                <span className="text-blue-300 font-semibold">Extra Deck:</span>{" "}
                List important fusion, synchro, xyz, or link monsters.
              </p>
            </div>
          </div>
        </section>

        {/* Phase 4: Tips & Best Practices */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2 drop-shadow-md">
            <span className="bg-blue-500/40 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-400/50">
              4
            </span>
            Tips & Best Practices
          </h3>
          <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 transition-shadow">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="aspect-square bg-slate-800/80 rounded-lg flex items-center justify-center text-slate-500 text-xs border border-slate-700/50">
                [Consistency]
              </div>
              <div className="aspect-square bg-slate-800/80 rounded-lg flex items-center justify-center text-slate-500 text-xs border border-slate-700/50">
                [Tech Choices]
              </div>
              <div className="aspect-square bg-slate-800/80 rounded-lg flex items-center justify-center text-slate-500 text-xs border border-slate-700/50">
                [Matchups]
              </div>
            </div>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-xs">
              <li>Include staple cards and tech choices</li>
              <li>Explain alternative combos and plan B strategies</li>
              <li>Mention common handtraps and how to play around them</li>
              <li>Update your guide when new support is released</li>
            </ul>
          </div>
        </section>

        {/* Final Notes */}
        <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-400/40 shadow-lg">
          <p className="text-blue-100 text-xs text-center">
            <span className="font-bold text-blue-300">💡 Pro Tip:</span> A good
            guide helps both new and experienced players. Be thorough and update
            regularly!
          </p>
        </div>
      </div>
    </InfoModal>
  );
};
