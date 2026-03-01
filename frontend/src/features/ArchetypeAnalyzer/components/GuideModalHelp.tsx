import { InfoModal } from "@/shared/components/info/components/InfoModal";
import {
  guideHelp_CardPairs,
  guideHelp_Header,
  guideHelp_Recommended,
  guideHelp_TitleAndDescr,
} from "../assets";

interface GuideModalHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModalHelp = ({ isOpen, onClose }: GuideModalHelpProps) => {
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      title="How to Create a Guide Correctly"
    >
      <div className="space-y-6 text-gray-200">
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2 drop-shadow-md">
            <span className="bg-blue-500/40 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-400/50">
              1
            </span>
            Header Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 transition-shadow">
              <img
                src={guideHelp_TitleAndDescr}
                alt="Title and description section example"
                className="w-full rounded-lg mb-2 border border-slate-700/50"
              />
              <p className="text-sm">
                <span className="text-blue-300 font-semibold">Title:</span> Give
                your guide a clear title.
                <br /> For a direct counter guide:{" "}
                <b>“How to counter [deck]”</b>
                <br />
                For a counter guide using a specific deck:{" "}
                <b>“How to counter [deck] using [deck]”</b>
                <br />
                <span className="text-blue-300 font-semibold">
                  Description:
                </span>{" "}
                Explain the main idea of your guide. You don't need to go into
                detail about countering cards here, but rather in the Card Pairs
                section.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 transition-shadow">
              <img
                src={guideHelp_Header}
                alt="Header card image example"
                className="w-full rounded-lg mb-2 border border-slate-700/50"
              />
              <p className="text-sm">
                <span className="text-blue-300 font-semibold">
                  Header Card:
                </span>{" "}
                Main card that represents the archetype you are discussing.
                <br />
                For a direct counter guide:{" "}
                <b>
                  Select a header card that represents the deck you are
                  countering
                </b>
                <br />
                For a counter guide using a specific deck:{" "}
                <b>
                  Select a header card that represents the deck you are using to
                  counter the other one
                </b>
                <br />
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
            Card Pairs
          </h3>
          <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 transition-shadow">
            <img
              src={guideHelp_CardPairs}
              alt="Card pair example showing target cards and their counters"
              className="w-full rounded-lg mb-2 border border-slate-700/50"
            />
            <p className="text-sm mb-2">
              <span className="text-blue-300 font-semibold">
                Creating Card Pairs:
              </span>{" "}
              The top cards are the <b>target</b> cards, and the bottom cards
              represent their <b>counters.</b>
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-xs">
              <li>
                <span className="text-blue-300 font-medium">
                  Top Cards (targets):
                </span>{" "}
                Key cards that you want to counter.
              </li>
              <li>
                <span className="text-blue-300 font-medium">
                  Bottom Cards (counters):
                </span>{" "}
                Cards that counter the top cards.
              </li>
              <li>
                <span className="text-blue-300 font-medium">
                  Effectiveness:
                </span>{" "}
                Rate the impact (Low/Medium/High).
              </li>
              <li>
                <span className="text-blue-300 font-medium">Comment:</span> Give
                a brief explanation, add tips, or mention things that players
                should be aware of.
              </li>
            </ul>
            <p className="text-xs mt-2">
              Note: You can also select cards without pairing them, and they
              will be treated as standalone counters or cards you want to
              discuss.
            </p>
          </div>
        </section>

        {/* Phase 3: Recommended Deck */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2 drop-shadow-md">
            <span className="bg-blue-500/40 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border border-blue-400/50">
              3
            </span>
            Recommended Deck (Optional)
          </h3>
          <p className="text-sm">
            If you are creating a counter guide using a specific deck (e.g.,{" "}
            <b>“How to counter [deck] using [deck]”</b>), you could create a
            recommended deck.
            <br />
            The recommended deck represents the deck you suggest playing against
            the archetype you are trying to counter.
          </p>
          <div className="bg-gradient-to-br from-blue-800/40 via-indigo-800/40 to-purple-800/40 rounded-lg p-3 border border-blue-400/30 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 transition-shadow">
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
