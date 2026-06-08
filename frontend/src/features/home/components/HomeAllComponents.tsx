import { CounterGuides } from "./CounterGuides";
import { DeckGuides } from "./DeckGuides";
import { GeneralStats } from "./GeneralStats";
import MDCBackground from "@/assets/HomeAllPages_Background2.webp";
import { GuideRequestsSection } from "@/features/guide-request";

interface HomeAllComponentsProps {
  isSearchActive?: boolean;
}

export const HomeAllComponents = ({
  isSearchActive = false,
}: HomeAllComponentsProps) => {
  return (
    <div
      className={`w-full mt-10 ${isSearchActive ? "opacity-70" : "opacity-85"}`}
    >
      <div className="bg-black/70 flex flex-col gap-8">
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

          <div className="relative z-10 p-8 max-[650px]:px-0 py-1 pb-3">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-auto lg:h-[650px] relative">
                <CounterGuides />
              </div>

              <div className="h-auto lg:h-[650px] relative">
                <DeckGuides />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px mx-8 bg-slate-600/40" />

        <div className="px-8">
          <GuideRequestsSection />
        </div>

        <div className="h-px mx-8 bg-slate-600/40" />

        <div className="px-8" aria-label="General statistics section">
          <div className="h-[530px]">
            <GeneralStats />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="lg:col-span-2" aria-hidden="true" />

          {/**Legacy containers */}
          {/* <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3">
            <div
              className="lg:col-span-2 h-[420px]"
              aria-label="Latest updates section"
            >
              <LatestUpdates />
            </div>

            <div className="h-[420px]" aria-label="Main features section">
              <MainFeatures />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};
