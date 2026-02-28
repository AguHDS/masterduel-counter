import { FramedContainer } from "@/layouts/FramedContainer";
import { GeneralStats } from "./GeneralStats";
import { LastCreatedGuides } from "./LastCreatedGuides";
import { CreateGuideInvite } from "./CreateGuideInvite";

export const HomeStatsSection = () => {
  return (
    <div className="w-full mb-8 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FramedContainer
          maxWidthClassName="max-w-full"
          contentClassName="h-[580px]"
          aria-label="General statistics"
        >
          <GeneralStats />
        </FramedContainer>

        <FramedContainer
          maxWidthClassName="max-w-full"
          contentClassName="h-[580px]"
          aria-label="Create guide invitation"
        >
          <CreateGuideInvite />
        </FramedContainer>

        <FramedContainer
          maxWidthClassName="max-w-full"
          contentClassName="h-[580px]"
          aria-label="Last created guides"
        >
          <LastCreatedGuides />
        </FramedContainer>
      </div>
    </div>
  );
};
