import { CounterGuides } from "./CounterGuides";
import { DeckGuides } from "./DeckGuides";
import { GeneralStats } from "./GeneralStats";
import { LatestUpdates } from "./LastestUpdates";

export const HomeStatsSection = () => {
  return (
    <div className="w-full mb-8 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 bg-black/70 shadow-2xl  p-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[550px]" aria-label="Counter guides section">
              <CounterGuides />
            </div>

            <div className="h-[550px]" aria-label="Deck guides section">
              <DeckGuides />
            </div>
          </div>
        </div>

        <div
          className="h-[550px] border-2 border-red-900"
          aria-label="General statistics section"
        >
          <GeneralStats />
        </div>

        <div className="h-[550px]" aria-label="Latest updates section">
          <LatestUpdates />
        </div>
      </div>
    </div>
  );
};
