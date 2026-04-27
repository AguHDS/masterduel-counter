import { InfoModal } from "@/shared/components/info/components/InfoModal";
import {
  guideHelp_CardPairs,
  guideHelp_Header,
  guideHelp_TitleAndDescr,
} from "../../assets";

interface CounterGuideHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Help modal that explains how to create Counter guides
 */
export const CounterGuideHelp = ({
  isOpen,
  onClose,
}: CounterGuideHelpProps) => {
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
                Preview image for your guide. It will be used as a thumbnail
                when listing.
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
              represent their <b>counters</b>
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-xs">
              <li>
                <span className="text-blue-300 font-medium">
                  Top Cards (targets):
                </span>{" "}
                Key cards that you want to counter
              </li>
              <li>
                <span className="text-blue-300 font-medium">
                  Bottom Cards (counters):
                </span>{" "}
                Cards that counter the top cards
              </li>
              <li>
                <span className="text-blue-300 font-medium">
                  Effectiveness:
                </span>{" "}
                Rate the impact (Bad/Medium/Good/Perfect)
              </li>
              <li>
                <span className="text-blue-300 font-medium">Comment:</span> Give
                a brief explanation, add tips, or mention things that players
                should be aware of.
              </li>
            </ul>
            <p className="text-xs mt-2">
              Note: if you want to show board breakers, you can select cards
              without pairing them
            </p>
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
