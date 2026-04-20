/**
 * Environment-aware URL configuration
 *
 * URLs are determined by VITE_QUERY_ENV:
 * - development: localhost URLs
 * - production: masterduelcounter.com URLs
 */

const isDevelopment = import.meta.env.VITE_QUERY_ENV === "development";

/**
 * Get the backend API base URL based on environment
 * @returns Backend URL (localhost:3001 in dev, masterduelcounter.com in prod)
 */
export function getBackendUrl(): string {
  return isDevelopment
    ? "http://localhost:3001"
    : "https://masterduelcounter.com";
}

/**
 * Get the frontend base URL based on environment
 * @returns Frontend URL (localhost:5173 in dev, masterduelcounter.com in prod)
 */
export function getFrontendUrl(): string {
  return isDevelopment
    ? "http://localhost:5173"
    : "https://masterduelcounter.com";
}

// Logic for normalizing legacy URLs
type PublicGuideType = string;

interface BuildGuidePathParams {
  guideId?: number;
  archetypeId?: number;
  archetypeName?: string | null;
  userName?: string | null;
  guideType?: PublicGuideType;
}

interface BuildProfilePathParams {
  userName?: string | null;
  profileId?: number | null;
  userId?: string | number | null;
  tab?: string;
}

interface BuildGuideEditorPathParams {
  archetypeId?: string | number | null;
  instanceId?: string | number | null;
  guideType?: PublicGuideType;
}

interface BuildArchetypePathParams {
  archetypeId?: string | number | null;
  archetypeName?: string | null;
  guideType?: PublicGuideType;
}

/** Slug for SEO-friendly URLs */
const slugifySegment = (value: string): string => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "unknown";
};

/** Public guide and profile urls only use the trailing id for data loading */
export function extractNumericIdFromSlug(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const match = value.match(/(\d+)$/);
  if (!match) {
    return undefined;
  }

  const parsedValue = Number.parseInt(match[1], 10);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
}

/** Infer the guide type from the slug */
export function inferGuideTypeFromSlug(
  guideSlug?: string,
): "COUNTER" | "DECK" | undefined {
  if (!guideSlug) {
    return undefined;
  }

  if (guideSlug.includes("deck-guide")) {
    return "DECK";
  }

  if (guideSlug.includes("counter-guide")) {
    return "COUNTER";
  }

  return undefined;
}

/** Build the public SEO-friendly guide URL from the available metadata */
export function buildGuidePath({
  guideId,
  archetypeId,
  archetypeName,
  userName,
  guideType,
}: BuildGuidePathParams): string {
  if (guideId && archetypeName && userName && guideType) {
    const typeSegment =
      String(guideType).toLowerCase() === "deck"
        ? "deck-guide"
        : "counter-guide";

    return `/archetypes/${slugifySegment(archetypeName)}/${slugifySegment(userName)}/${typeSegment}-${guideId}`;
  }

  if (archetypeId && guideId) {
    const typeQuery = guideType
      ? `?type=${String(guideType).toLowerCase()}`
      : "";

    return `/archetype/${archetypeId}/instance/${guideId}${typeQuery}`;
  }

  return "/guides";
}

/** Build the public archetype list URL using the archetype name slug whenever possible */
export function buildArchetypePath({
  archetypeId,
  archetypeName,
  guideType,
}: BuildArchetypePathParams): string {
  const typeQuery = guideType
    ? `?type=${String(guideType).toLowerCase()}`
    : "";

  if (archetypeName) {
    return `/archetype/${slugifySegment(archetypeName)}${typeQuery}`;
  }

  if (archetypeId) {
    return `/archetype/${archetypeId}${typeQuery}`;
  }

  return `/guides${typeQuery}`;
}

/** Prefer username-userId so profile links stay descriptive without extra redirects */
export function buildProfilePath({
  userName,
  profileId,
  userId,
  tab,
}: BuildProfilePathParams): string {
  const tabSuffix = tab ? `/${tab}` : "";

  if (userName && userId) {
    return `/profile/${slugifySegment(userName)}-${userId}${tabSuffix}`;
  }

  if (userName && typeof profileId === "number") {
    return `/profile/${slugifySegment(userName)}-${profileId}${tabSuffix}`;
  }

  if (userId) {
    return `/profile/${userId}${tabSuffix}`;
  }

  return `/profile${tabSuffix}`;
}

/**
 * Build the internal id-based guide route used for draft creation,
 * direct editor access, and legacy SPA compatibility
 */
export function buildGuideEditorPath({
  archetypeId,
  instanceId = "new",
  guideType,
}: BuildGuideEditorPathParams): string {
  if (!archetypeId) {
    return "/guides";
  }

  const typeQuery = guideType
    ? `?type=${String(guideType).toLowerCase()}`
    : "";

  return `/archetype/${archetypeId}/instance/${instanceId}${typeQuery}`;
}
