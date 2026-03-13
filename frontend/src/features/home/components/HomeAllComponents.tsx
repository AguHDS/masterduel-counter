import { CounterGuides } from "./CounterGuides";
import { DeckGuides } from "./DeckGuides";
import { GeneralStats } from "./GeneralStats";
import { LatestUpdates } from "./LastestUpdates";
import { MainFeatures } from "./MainFeatures";

export const HomeAllComponents = () => {
  return (
    <div className="w-full mb-8 mt-4">
      <div className="bg-black/70 shadow-2xl p-1 rounded-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-[550px]" aria-label="Counter guides section">
                <CounterGuides />
              </div>

              <div className="h-[550px]" aria-label="Deck guides section">
                <DeckGuides />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 h-2" aria-hidden="true" />

          <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3">
            <div
              className="lg:col-span-2 h-[420px]"
              aria-label="Latest updates section"
            >
              <LatestUpdates />
            </div>

            <div className="h-[420px]" aria-label="Main features section">
              <MainFeatures />
            </div>
          </div>

          <div className="lg:col-span-2 h-2" aria-hidden="true" />

          <div
            className="lg:col-span-2 h-[500px]"
            aria-label="General statistics section"
          >
            <GeneralStats />
          </div>
        </div>
      </div>
    </div>
  );
};
