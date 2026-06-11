import type { Card } from "@/features/archetypes/types";
import type { User } from "@/features/auth";
import { FloatingCardSearchModal } from "@/features/archetypes/components/FloatingCardSearchModal";
import { ReportModal } from "@/features/report/components/ReportModal";
import {
  GuideRequestFullModal,
} from "@/features/guide-request";

interface GuideModalsProps {
  isSelectingHeader: boolean;
  headerAnchor: HTMLElement | null;
  isReportModalOpen: boolean;
  isSourceRequestModalOpen: boolean;
  guideInstanceId: number | undefined;
  guideInstanceTitle: string | undefined;
  sourceRequest: { id: number; title: string } | null;
  currentUser: User | null;
  onCloseHeaderModal: () => void;
  onSelectHeaderCard: (card: Card) => void;
  onCloseReportModal: () => void;
  onCloseSourceRequestModal: () => void;
}

/** Renders modals for guide-related actions */
export const GuideModals = ({
  isSelectingHeader,
  headerAnchor,
  isReportModalOpen,
  isSourceRequestModalOpen,
  guideInstanceId,
  guideInstanceTitle,
  sourceRequest,
  currentUser,
  onCloseHeaderModal,
  onSelectHeaderCard,
  onCloseReportModal,
  onCloseSourceRequestModal,
}: GuideModalsProps) => {
  return (
    <>
      {isSelectingHeader && (
        <FloatingCardSearchModal
          isOpen={true}
          onClose={onCloseHeaderModal}
          onSelectCard={onSelectHeaderCard}
          title="Select Header Card"
          anchorElement={headerAnchor}
          autoCloseAfterSelect={true}
        />
      )}

      {isReportModalOpen && guideInstanceId !== undefined && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={onCloseReportModal}
          targetType="instance"
          targetId={guideInstanceId}
          targetName={guideInstanceTitle ?? ""}
        />
      )}

      {sourceRequest && (
        <GuideRequestFullModal
          isOpen={isSourceRequestModalOpen}
          onClose={onCloseSourceRequestModal}
          currentUser={currentUser ?? null}
          initialTab="COMPLETED"
          initialRequestId={sourceRequest.id}
        />
      )}
    </>
  );
};
