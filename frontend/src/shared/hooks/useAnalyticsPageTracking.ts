import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/config/analytics';

/**
 * Hook to track page views automatically when the route changes
 * 
 * This hook must be used INSIDE the React Router
 * Executed whenever location.pathname or location.search changes
 * 
 * Only track in production (build) to avoid contaminating development data
 */
export function useAnalyticsPageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.VITE_QUERY_ENV !== 'production') {
      return;
    }

    const fullPath = location.pathname + location.search;
    trackPageView(fullPath);
  }, [location.pathname, location.search]);
}
