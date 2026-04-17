import { Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type {
  CardPair,
  ComboStep,
  GuideType,
} from "@/features/archetypes/types";
import { CardPairEditor } from "./CardPairEditor";
import { ComboFlowSection } from "./ComboFlowSection";
import { InitialHandsEditor, type InitialHand } from "./InitialHandsEditor";
import { RecommendedDeckEditor } from "./RecommendedDeckEditor";

type ActiveModalComponent =
  | "recommended-deck"
  | "initial-hands"
  | "card-pairs"
  | "combo-steps"
  | null;

interface GuideTypeContentSectionProps {
  guideType: GuideType;
  isEditMode: boolean;
  isOwner: boolean;
  activeModalComponent: ActiveModalComponent;
  onModalStateChange: (
    component: Exclude<ActiveModalComponent, null>,
    isOpen: boolean,
  ) => void;
  pairs: CardPair[];
  setPairs: Dispatch<SetStateAction<CardPair[]>>;
  loadedPairs: CardPair[];
  onAddPair: () => void;
  initialHands: InitialHand[];
  setInitialHands: Dispatch<SetStateAction<InitialHand[]>>;
  selectedHandId: string | null;
  onSelectHand: (handId: string) => void;
  onAddInitialHand: () => void;
  onAddCombo: (handId: string) => void;
  onShowCombo: (handId: string) => void;
  onDuplicateHand?: (originalHandId: string, newHandId: string) => void;
  comboSteps: Map<string, ComboStep[]>;
  showComboFlow: boolean;
  selectedHandComboSteps: ComboStep[];
  setSelectedHandComboSteps: (value: SetStateAction<ComboStep[]>) => void;
  showRecommendedDeck: boolean;
  hasRecommendedDeckFromServer: boolean;
  onShowRecommendedDeck: () => void;
  displayTitle?: string;
  displayMainDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  displayExtraDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  displaySideDeck: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  onDeckChange: (
    title: string,
    mainDeck: GuideTypeContentSectionProps["displayMainDeck"],
    extraDeck: GuideTypeContentSectionProps["displayExtraDeck"],
    sideDeck: GuideTypeContentSectionProps["displaySideDeck"],
  ) => void;
  onDeleteDeck: () => Promise<void>;
}

/** Renders specific content by guide type and recommended deck section */
export const GuideTypeContentSection = ({
  guideType,
  isEditMode,
  isOwner,
  activeModalComponent,
  onModalStateChange,
  pairs,
  setPairs,
  loadedPairs,
  onAddPair,
  initialHands,
  setInitialHands,
  selectedHandId,
  onSelectHand,
  onAddInitialHand,
  onAddCombo,
  onShowCombo,
  onDuplicateHand,
  comboSteps,
  showComboFlow,
  selectedHandComboSteps,
  setSelectedHandComboSteps,
  showRecommendedDeck,
  hasRecommendedDeckFromServer,
  onShowRecommendedDeck,
  displayTitle,
  displayMainDeck,
  displayExtraDeck,
  displaySideDeck,
  onDeckChange,
  onDeleteDeck,
}: GuideTypeContentSectionProps) => {
  return (
    <>
      {guideType === "COUNTER" ? (
        <>
          <div className="mt-8">
            <CardPairEditor
              isEditMode={isEditMode && isOwner}
              initialPairs={loadedPairs}
              pairs={pairs}
              setPairs={setPairs}
              onAddPair={isEditMode && isOwner ? onAddPair : undefined}
              onModalStateChange={(isOpen) =>
                onModalStateChange("card-pairs", isOpen)
              }
              forceCloseModal={
                activeModalComponent !== null &&
                activeModalComponent !== "card-pairs"
              }
            />
          </div>

          {isEditMode && isOwner && (
            <div className="flex justify-center">
              <button
                onClick={onAddPair}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Card Pair</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mt-8">
            <InitialHandsEditor
              isEditMode={isEditMode && isOwner}
              initialHands={initialHands}
              setInitialHands={setInitialHands}
              onAddHand={isEditMode && isOwner ? onAddInitialHand : undefined}
              onModalStateChange={(isOpen) =>
                onModalStateChange("initial-hands", isOpen)
              }
              forceCloseModal={
                activeModalComponent !== null &&
                activeModalComponent !== "initial-hands"
              }
              selectedHandId={selectedHandId}
              onSelectHand={onSelectHand}
              onAddCombo={isEditMode && isOwner ? onAddCombo : undefined}
              onShowCombo={!isEditMode ? onShowCombo : undefined}
              onDuplicateHand={onDuplicateHand}
              comboSteps={comboSteps}
            />
          </div>

          {selectedHandId &&
            initialHands.length > 0 &&
            showComboFlow &&
            (selectedHandComboSteps.length > 0 || (isEditMode && isOwner)) && (
              <ComboFlowSection
                selectedHandNumber={
                  initialHands.findIndex((hand) => hand.id === selectedHandId) +
                  1
                }
                comboSteps={selectedHandComboSteps}
                setComboSteps={setSelectedHandComboSteps}
                isEditMode={isEditMode && isOwner}
                initialHandId={selectedHandId}
                onModalStateChange={(isOpen) =>
                  onModalStateChange("combo-steps", isOpen)
                }
                forceCloseModal={
                  activeModalComponent !== null &&
                  activeModalComponent !== "combo-steps"
                }
                onResetCanceledFlow={() => {
                  // Callback intentionally no-op: reset handled inside ComboFlowSection.
                }}
              />
            )}
        </>
      )}

      {guideType === "DECK" && (
        <>
          {(showRecommendedDeck || hasRecommendedDeckFromServer) && (
            <div className="flex justify-center my-8">
              <div className="w-4/5 h-px bg-gradient-to-r my-4 from-transparent via-slate-600 to-transparent"></div>
            </div>
          )}

          {isEditMode &&
            isOwner &&
            !showRecommendedDeck &&
            !hasRecommendedDeckFromServer && (
              <div className="flex justify-center my-8">
                <button
                  onClick={onShowRecommendedDeck}
                  className="flex items-center space-x-2 px-4 mt-8 py-2 bg-green-600 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Deck</span>
                </button>
              </div>
            )}

          {showRecommendedDeck && (
            <div id="recommended-deck-section">
              <RecommendedDeckEditor
                isEditMode={isEditMode && isOwner}
                initialTitle={displayTitle}
                initialMainDeck={displayMainDeck}
                initialExtraDeck={displayExtraDeck}
                initialSideDeck={displaySideDeck}
                onDeckChange={onDeckChange}
                onDelete={onDeleteDeck}
                onModalStateChange={(isOpen) =>
                  onModalStateChange("recommended-deck", isOpen)
                }
                forceCloseModal={
                  activeModalComponent !== null &&
                  activeModalComponent !== "recommended-deck"
                }
              />
            </div>
          )}
        </>
      )}
    </>
  );
};
