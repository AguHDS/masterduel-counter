import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface UseCanonicalPathRedirectOptions {
  includeSearch?: boolean;
}

/**
 * Client-side canonicalization complements the backend 301 redirects during SPA navigation.
 */
export function useCanonicalPathRedirect(
  canonicalPath?: string | null,
  options: UseCanonicalPathRedirectOptions = {},
) {
  const navigate = useNavigate();
  const location = useLocation();
  const { includeSearch = false } = options;

  useEffect(() => {
    if (!canonicalPath) {
      return;
    }

    const currentPath = includeSearch
      ? `${location.pathname}${location.search}`
      : location.pathname;

    // Don't redirect if:
    // 1. Already on canonical path
    if (currentPath === canonicalPath) {
      return;
    }

    // 2. User is navigating to guide editor (contains /instance/)
    // This prevents interference with intentional navigation to create/edit guides
    if (currentPath.includes('/instance/')) {
      return;
    }

    // 3. Archetype paths: prevent redirect when canonical data is stale
    // When navigating between different archetypes via search, the canonicalPath
    // may briefly use the previous archetype's data with the new guideType.
    // If the guideType differs between current and canonical, skip redirect.
    if (currentPath.includes('/archetype/') && canonicalPath.includes('/archetype/')) {
      const currentArchetype = currentPath.match(/\/archetype\/([^/]+)/)?.[1];
      const canonicalArchetype = canonicalPath.match(/\/archetype\/([^/]+)/)?.[1];

      if (currentArchetype !== canonicalArchetype) {
        return; // Don't redirect when archetypes differ (transitioning between pages)
      }

      // Same archetype but different guideType — canonical data may be stale
      const currentGuideType = currentPath.match(/\/(deck-guides|counter-guides)(?:\/|$)/)?.[1];
      const canonicalGuideType = canonicalPath.match(/\/(deck-guides|counter-guides)(?:\/|$)/)?.[1];
      if (currentGuideType && canonicalGuideType && currentGuideType !== canonicalGuideType) {
        return;
      }
    }

    navigate(canonicalPath, { replace: true });
  }, [
    canonicalPath,
    includeSearch,
    location.pathname,
    location.search,
    navigate,
  ]);
}
