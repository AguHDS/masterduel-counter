import { Plus } from "lucide-react";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import type {
  CardPair,
  ComboStep,
  GuideType,
} from "@/features/archetypes/types";
import { CardPairEditor } from "./counter-guides/CardPairEditor";
import { ComboFlowSection } from "./deck-guides/combo-step-editor/ComboFlowSection";
import {
  InitialHandsEditor,
  type InitialHand,
} from "./deck-guides/InitialHandsEditor";
import { RecommendedDeckEditor } from "./deck-guides/RecommendedDeckEditor";

type ActiveModalComponent =
  | "recommended-deck"
  | "initial-hands"
  | "card-pairs-handtraps"
  | "card-pairs-board-breakers"
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
  onAddHandtrap: () => void;
  onAddBoardBreaker: () => void;
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

/**
 * Main content section that renders the appropriate editor based on guide type
 * Counter guides: Shows HANDTRAP and BOARD_BREAKER card pair sections
 * Deck guides: Shows initial hands, combo flow editor/viewer, final board preview, recommended deck
 */
export const GuideTypeContentSection = ({
  guideType,
  isEditMode,
  isOwner,
  activeModalComponent,
  onModalStateChange,
  pairs,
  setPairs,
  onAddHandtrap,
  onAddBoardBreaker,
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
  onShowRecommendedDeck,
  displayTitle,
  displayMainDeck,
  displayExtraDeck,
  displaySideDeck,
  onDeckChange,
  onDeleteDeck,
}: GuideTypeContentSectionProps) => {
  const handtrapPairs = useMemo(
    () =>
      pairs.filter(
        (pair) => pair.section === "HANDTRAP" || pair.section == null,
      ),
    [pairs],
  );

  const boardBreakerPairs = useMemo(
    () => pairs.filter((pair) => pair.section === "BOARD_BREAKER"),
    [pairs],
  );

  const hasHandtraps = handtrapPairs.length > 0;
  const hasBoardBreakers = boardBreakerPairs.length > 0;

  const setHandtrapPairs: Dispatch<SetStateAction<CardPair[]>> = (value) => {
    setPairs((prevPairs) => {
      const currentHandtraps = prevPairs.filter(
        (pair) => pair.section === "HANDTRAP" || pair.section == null,
      );
      const nextHandtrapsRaw =
        typeof value === "function" ? value(currentHandtraps) : value;
      const nextHandtraps = nextHandtrapsRaw.map((pair) => ({
        ...pair,
        section: "HANDTRAP" as const,
      }));
      const nonHandtraps = prevPairs.filter(
        (pair) => pair.section === "BOARD_BREAKER",
      );

      return [...nextHandtraps, ...nonHandtraps];
    });
  };

  const setBoardBreakerPairs: Dispatch<SetStateAction<CardPair[]>> = (
    value,
  ) => {
    setPairs((prevPairs) => {
      const currentBoardBreakers = prevPairs.filter(
        (pair) => pair.section === "BOARD_BREAKER",
      );
      const nextBoardBreakersRaw =
        typeof value === "function" ? value(currentBoardBreakers) : value;
      const nextBoardBreakers = nextBoardBreakersRaw.map((pair) => ({
        ...pair,
        section: "BOARD_BREAKER" as const,
      }));
      const nonBoardBreakers = prevPairs.filter(
        (pair) => pair.section !== "BOARD_BREAKER",
      );

      return [...nonBoardBreakers, ...nextBoardBreakers];
    });
  };

  return (
    <>
      {guideType === "COUNTER" ? (
        <>
          <div className="mt-8 space-y-8">
            {hasHandtraps && (
              <div id="handtraps-section" className="space-y-4">
                <div className="flex items-center gap-3 w-full">
                  <h3 className="text-xl font-bold text-blue-300 whitespace-nowrap">
                    Handtraps
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                </div>
                <CardPairEditor
                  isEditMode={isEditMode && isOwner}
                  pairs={handtrapPairs}
                  setPairs={setHandtrapPairs}
                  onAddPair={isEditMode && isOwner ? onAddHandtrap : undefined}
                  addPlaceholderLabel="+ Add Handtrap"
                  onModalStateChange={(isOpen) =>
                    onModalStateChange("card-pairs-handtraps", isOpen)
                  }
                  forceCloseModal={
                    activeModalComponent !== null &&
                    activeModalComponent !== "card-pairs-handtraps"
                  }
                />
              </div>
            )}

            {hasBoardBreakers && (
              <div id="board-breakers-section" className="space-y-4">
                <div className="flex items-center gap-3 w-full mt-16">
                  <h3 className="text-xl font-bold text-blue-300 whitespace-nowrap">
                    Board Breakers
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-400/55 to-transparent" />
                </div>
                <CardPairEditor
                  isEditMode={isEditMode && isOwner}
                  pairs={boardBreakerPairs}
                  setPairs={setBoardBreakerPairs}
                  onAddPair={
                    isEditMode && isOwner ? onAddBoardBreaker : undefined
                  }
                  addPlaceholderLabel="+ Add Board Breaker"
                  onModalStateChange={(isOpen) =>
                    onModalStateChange("card-pairs-board-breakers", isOpen)
                  }
                  forceCloseModal={
                    activeModalComponent !== null &&
                    activeModalComponent !== "card-pairs-board-breakers"
                  }
                />
              </div>
            )}

            {isEditMode && isOwner && (!hasHandtraps || !hasBoardBreakers) && (
              <div className="flex justify-center gap-3 flex-wrap">
                {!hasHandtraps && (
                  <button
                    onClick={onAddHandtrap}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Handtrap</span>
                  </button>
                )}

                {!hasBoardBreakers && (
                  <button
                    onClick={onAddBoardBreaker}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Board Breaker</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mt-8 max-[1023px]:pl-4">
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
          {(showRecommendedDeck) && (
            <div className="flex justify-center my-8">
              <div className="w-4/5 h-px bg-gradient-to-r my-4 from-transparent via-slate-600 to-transparent"></div>
            </div>
          )}

          {isEditMode &&
            isOwner &&
            !showRecommendedDeck && (
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
            <div id="recommended-deck-section" className="max-[1023px]:pl-4">
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
