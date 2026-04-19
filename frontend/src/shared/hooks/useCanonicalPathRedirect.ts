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

    if (currentPath !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [
    canonicalPath,
    includeSearch,
    location.pathname,
    location.search,
    navigate,
  ]);
}
