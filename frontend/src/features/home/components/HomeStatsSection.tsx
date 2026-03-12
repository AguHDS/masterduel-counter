import { HomeFeatureContainer } from "@/layouts/HomeFeatureContainer";
import { GeneralStats } from "./GeneralStats";
import { LastCreatedGuides } from "./LastCreatedGuides";
import { CreateGuideInvite } from "./CreateGuideInvite";

export const HomeStatsSection = () => {
  return (
    <div className="w-full mb-8 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HomeFeatureContainer
          maxWidthClassName="max-w-full"
          contentClassName="h-[580px]"
          aria-label="General statistics"
        >
          <GeneralStats />
        </HomeFeatureContainer>

        <HomeFeatureContainer
          maxWidthClassName="max-w-full"
          contentClassName="h-[580px]"
          aria-label="Create guide invitation"
        >
          <CreateGuideInvite />
        </HomeFeatureContainer>

        <HomeFeatureContainer
          maxWidthClassName="max-w-full"
          contentClassName="h-[580px]"
          aria-label="Last created guides"
        >
          <LastCreatedGuides />
        </HomeFeatureContainer>
      </div>
    </div>
  );
};
