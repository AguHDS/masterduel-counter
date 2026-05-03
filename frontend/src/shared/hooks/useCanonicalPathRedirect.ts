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

    // 3. User is navigating to a completely different route (not just a variant of current archetype)
    // e.g., don't redirect /archetype/129/instance/new back to /archetype/dark-tuner/counter-guides
    if (currentPath.includes('/archetype/') && canonicalPath.includes('/archetype/')) {
      const currentArchetype = currentPath.match(/\/archetype\/([^/]+)/)?.[1];
      const canonicalArchetype = canonicalPath.match(/\/archetype\/([^/]+)/)?.[1];
      
      // If the archetype IDs/slugs don't match, don't redirect
      // This happens when navigating from slug to ID or vice versa during navigation
      if (currentArchetype !== canonicalArchetype) {
        // Only redirect if both are slugs (string) or both are IDs (number)
        const currentIsNumeric = /^\d+$/.test(currentArchetype || '');
        const canonicalIsNumeric = /^\d+$/.test(canonicalArchetype || '');
        
        if (currentIsNumeric !== canonicalIsNumeric) {
          return; // Don't redirect when one is slug and other is ID during navigation
        }
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
