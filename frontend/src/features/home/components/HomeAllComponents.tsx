import { CounterGuides } from "./CounterGuides";
import { DeckGuides } from "./DeckGuides";
import { GeneralStats } from "./GeneralStats";
import { LatestUpdates } from "./LastestUpdates";
import { MainFeatures } from "./MainFeatures";
import MDCBackground from "@/assets/HomeAllPages_Background2.webp";

interface HomeAllComponentsProps {
  isSearchActive?: boolean;
}

export const HomeAllComponents = ({ isSearchActive = false }: HomeAllComponentsProps) => {
  return (
    <div className={`w-full mt-12 transition-opacity duration-300 ${isSearchActive ? 'opacity-70' : 'opacity-85'}`}>
      <div className="bg-black/40 ">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute" />
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${MDCBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <div className="absolute inset-0 bg-black/45 pointer-events-none border border-slate-500/20" />

          <div className="relative z-10 p-8 py-1 pb-3">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-[650px] relative">
                <CounterGuides />
              </div>

              <div className="h-[650px] relative">
                <DeckGuides />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
          <div className="lg:col-span-2" aria-hidden="true" />

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

          <div className="lg:col-span-2" aria-hidden="true" />

          <div
            className="lg:col-span-2 h-[550px]"
            aria-label="General statistics section"
          >
            <GeneralStats />
          </div>
        </div>
      </div>
    </div>
  );
};