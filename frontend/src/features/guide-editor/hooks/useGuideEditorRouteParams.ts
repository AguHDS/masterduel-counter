import { useState } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { GuideType } from "@/features/archetypes/types";
import {
  extractNumericIdFromSlug,
  inferGuideTypeFromSlug,
} from "@/lib/config/urlHelpers";

/** Extracts and normalizes guide editor routing parameters and initial state from the URL and navigation context */
export const useGuideEditorRouteParams = () => {
  const { archetypeId, instanceId, guideSlug } = useParams<{
    archetypeId?: string;
    instanceId?: string;
    guideSlug?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const legacyArchetypeIdNum = archetypeId
    ? Number.parseInt(archetypeId, 10)
    : undefined;

  const isCreatingNew = instanceId === "new";

  const parsedInstanceId = !isCreatingNew
    ? instanceId
      ? Number.parseInt(instanceId, 10)
      : extractNumericIdFromSlug(guideSlug)
    : undefined;

  const instanceIdNum =
    parsedInstanceId !== undefined && !Number.isNaN(parsedInstanceId)
      ? parsedInstanceId
      : undefined;

  const typeFromUrl = searchParams.get("type");
  const typeFromState = (
    location.state as { guideType?: GuideType; guideRequestId?: number }
  )?.guideType;
  const guideRequestId =
    (location.state as { guideRequestId?: number })?.guideRequestId ?? null;
  const typeFromSlug = inferGuideTypeFromSlug(guideSlug);

  const initialGuideType: GuideType =
    typeFromUrl === "counter"
      ? "COUNTER"
      : typeFromUrl === "deck"
        ? "DECK"
        : (typeFromSlug ?? typeFromState ?? "COUNTER");

  const [guideType, setGuideType] = useState<GuideType>(initialGuideType);
  const initialDraftId = searchParams.get("draftId");

  return {
    archetypeId,
    instanceId,
    guideSlug,
    navigate,
    location,
    legacyArchetypeIdNum,
    isCreatingNew,
    instanceIdNum,
    guideType,
    setGuideType,
    guideRequestId,
    initialDraftId,
  };
};
