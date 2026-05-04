import { InfoModal } from "@/shared/components/info/components/InfoModal";
import {
  deckguide_comboflow,
  guideHelp_Recommended,
  deckguide_initialhands,
} from "../../assets";

interface DeckGuideHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Help modal that explains how to create Deck guides
 */
export const DeckGuideHelp = ({ isOpen, onClose }: DeckGuideHelpProps) => {
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      title="How to Correctly Create a Deck Guide"
    >
      <div className="space-y-6 text-gray-200">
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2 drop-shadow-md">
            <span className="bg-blue-500/40 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-400/50">
              1
            </span>
            Initial hands & Board Preview
          </h3>
          <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30">
            <img
              src={deckguide_initialhands}
              alt="Card pair example showing target cards and their counters"
              className="w-full rounded-lg mb-2 border border-slate-700/50"
            />
            <p className="text-sm mb-2">
              <span className="text-blue-300 font-semibold">
                Initial Hands:
              </span>{" "}
              Represents the starting hand of the combo you are showcasing in
              the combo flow.
            </p>
            <span className="text-blue-300 font-semibold">
                Final Board Preview:
              </span>{" "}
              An example of the result of the combo flow you created for that initial hand.
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2 drop-shadow-md">
            <span className="bg-blue-500/40 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-400/50">
              2
            </span>
            Combo Flow
          </h3>
          <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30">
            <img
              src={deckguide_comboflow}
              alt="Card pair example showing target cards and their counters"
              className="w-full rounded-lg mb-2 border border-slate-700/50"
            />
            <p className="text-sm mb-2">
              <span className="text-blue-300 font-semibold">
                Creating Combo flow:
              </span>{" "}
              Create a step by step combo guide for your selected initial hand.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-xs">
              <li>
                <span className="text-blue-300 font-medium">
                  Left mini cards:
                </span>{" "}
                Use these cards to show the material cards you use to summon the
                main card.
              </li>
              <li>
                <span className="text-blue-300 font-medium">
                  Right mini cards:
                </span>{" "}
                The result of the activation effect of the main card's sequence.
              </li>
              <li>
                <span className="text-blue-300 font-medium">
                  <span className="text-red-500">Negated flow:</span>
                </span>{" "}
                You can put a secondary combo route for each step you have by
                clicking the "Negated?" label.
              </li>
              <li>
                <span className="text-blue-300 font-medium">Comment:</span> Give
                a brief explanation, add tips, or mention things that players
                should be aware of.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2 drop-shadow-md">
            <span className="bg-blue-500/40 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-400/50">
              3
            </span>
            Recommended Deck (Optional)
          </h3>
          <p className="text-sm">
            Deck builder to show the deck of this guide.
          </p>
          <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30">
            <img
              src={guideHelp_Recommended}
              alt="Recommended deck sections example showing main and extra deck"
              className="w-full rounded-lg mb-2 border border-slate-700/50"
            />
            <div className="text-sm space-y-1">
              <p>
                <span className="text-blue-300 font-semibold">Main Deck:</span>{" "}
                Cards from the main deck (Max. 60).
              </p>
              <p>
                <span className="text-blue-300 font-semibold">Extra Deck:</span>{" "}
                Cards from the extra deck (Max. 15).
              </p>
              <p>
                <span className="text-blue-300 font-semibold">
                  Side Deck (optional):
                </span>{" "}
                Alternative cards (Max. 20).
              </p>
            </div>
          </div>
        </section>

        <div className="bg-gradient-to-r flex justify-center m-auto w-fit from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-400/40 shadow-lg">
          <p className="text-blue-200 text-sm text-center font-medium">
            Guides are ordered by their last update by default. Keep your guides
            up to date to ensure they remain visible and relevant.
          </p>
        </div>
      </div>
    </InfoModal>
  );
};
