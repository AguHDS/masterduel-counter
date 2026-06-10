import { useCounterGuideData } from "./counter-guides/useCounterGuideData";
import type { CardPair, ComboStep, GuideType } from "@/features/archetypes/types";
import type { InitialHand } from "../components/deck-guides/InitialHandsEditor";
import type { GuideInstanceWithFullDetails } from "@/lib/http/guideInstancesApi";
import {
  mapGuideCardPairsToEditorPairs,
  mapInitialHandsAndComboStepsFromInstance,
} from "../utils/guideContainerTransforms";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlCropped: string;
}

interface CounterGuideInstanceData {
  cardPairs: Array<{
    id: number;
    pairSection?: "HANDTRAP" | "BOARD_BREAKER" | null;
    topCards: Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
      imageUrlCropped: string;
    }>;
    bottomCards: Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
      imageUrlCropped: string;
      effectiveness?: string;
    }>;
    comment?: string;
  }>;
  instance: {
    id: number;
    title: string;
    generalTip?: string | null;
    likes: number;
    favorites: number;
    guideType?: string;
    isDraft?: boolean;
    userId?: string;
  };
  headerCard?: {
    id: number;
    name: string;
    imageUrl: string;
    imageUrlCropped: string;
  } | null;
  userName?: string;
  initialHands?: unknown;
}

interface UseGuideDataSyncParams {
  isCreatingNew: boolean;
  guideInstanceData: CounterGuideInstanceData | undefined;
  isError: boolean;
  isOwner: boolean;
  isAuthenticated: boolean;
  setTitle: (title: string) => void;
  setGeneralTip: (tip: string) => void;
  setHeaderCard: (card: HeaderCard | null) => void;
  setIsEditMode: (edit: boolean) => void;
  setLikeCount: (count: number) => void;
  setLiked: (liked: boolean) => void;
  setFavoriteCount: (count: number) => void;
  setFavorited: (favorited: boolean) => void;
  setGuideType: (type: GuideType) => void;
  setPairs: React.Dispatch<React.SetStateAction<CardPair[]>>;
  setInitialHands: React.Dispatch<React.SetStateAction<InitialHand[]>>;
  setComboSteps: React.Dispatch<React.SetStateAction<Map<string, ComboStep[]>>>;
  setSelectedHandId: React.Dispatch<React.SetStateAction<string | null>>;
  setShowComboFlow: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRecommendedDeck: (show: boolean) => void;
  loadLikeStatus: () => Promise<void>;
  loadFavoriteStatus: () => Promise<void>;
  markClean: () => void;
}

/** Maps guide instance data to editor state and initializes related UI, draft, like, and favorite states */
export const useGuideDataSync = ({
  isCreatingNew,
  guideInstanceData,
  isError,
  isOwner,
  isAuthenticated,
  setTitle,
  setGeneralTip,
  setHeaderCard,
  setIsEditMode,
  setLikeCount,
  setLiked,
  setFavoriteCount,
  setFavorited,
  setGuideType,
  setPairs,
  setInitialHands,
  setComboSteps,
  setSelectedHandId,
  setShowComboFlow,
  setShowRecommendedDeck,
  loadLikeStatus,
  loadFavoriteStatus,
  markClean,
}: UseGuideDataSyncParams) => {
  useCounterGuideData({
    isCreatingNew,
    guideInstanceData,
    isError,
    isOwner,
    onDataLoaded: (data) => {
      const sanitizedTitle = data.title.replace(/\s+/g, " ").trim();
      const generalTip = data.generalTip || "";
      const headerCard: HeaderCard | null = data.headerCard
        ? {
            id: data.headerCard.id,
            name: data.headerCard.name,
            imageUrl: data.headerCard.imageUrl,
            imageUrlCropped: data.headerCard.imageUrlCropped,
          }
        : null;

      if (guideInstanceData?.instance.guideType) {
        setGuideType(guideInstanceData.instance.guideType as GuideType);
      }

      setTitle(sanitizedTitle);
      setGeneralTip(generalTip);
      setHeaderCard(headerCard);
      setLikeCount(data.likes);
      setFavoriteCount(data.favorites);

      const loadedGuide = guideInstanceData?.instance;
      if (loadedGuide?.isDraft) {
        setIsEditMode(true);
      } else {
        setIsEditMode(false);
      }

      markClean();

      const transformedPairs = mapGuideCardPairsToEditorPairs(
        data.pairs as CardPair[],
      );
      setPairs(transformedPairs as CardPair[]);

      if (
        guideInstanceData?.instance.guideType === "DECK" &&
        guideInstanceData.initialHands
      ) {
        const {
          initialHands: transformedHands,
          comboSteps: comboStepsMap,
        } = mapInitialHandsAndComboStepsFromInstance(
          guideInstanceData.initialHands as NonNullable<
            GuideInstanceWithFullDetails["initialHands"]
          >,
        );

        setInitialHands(transformedHands);
        setComboSteps(comboStepsMap);

        if (transformedHands.length > 0) {
          setSelectedHandId(transformedHands[0].id);
          if (
            comboStepsMap.has(transformedHands[0].id.toString()) &&
            comboStepsMap.get(transformedHands[0].id.toString())!.length > 0
          ) {
            setShowComboFlow(true);
          }
        }
      } else {
        setInitialHands([]);
        setComboSteps(new Map());
        setSelectedHandId(null);
      }

      if (isAuthenticated && !isOwner) {
        loadLikeStatus();
      } else {
        setLiked(false);
      }

      if (isAuthenticated) {
        loadFavoriteStatus();
      } else {
        setFavorited(false);
      }
    },
    onNewInstance: () => {
      setIsEditMode(true);
      setHeaderCard(null);
      setTitle("Title");
      setGeneralTip("");
      setLiked(false);
      setLikeCount(0);
      setFavorited(false);
      setPairs([]);
      setInitialHands([]);
    },
    onReset: () => {
      setHeaderCard(null);
      setTitle("Title");
      setGeneralTip("");
      setLiked(false);
      setLikeCount(0);
      setFavorited(false);
      setPairs([]);
      setInitialHands([]);
      setShowRecommendedDeck(false);
    },
  });
};
