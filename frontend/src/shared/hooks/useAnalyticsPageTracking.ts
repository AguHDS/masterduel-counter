import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/config/analytics';

/**
 * Hook para trackear page views automáticamente cuando cambia la ruta.
 * 
 * Este hook debe ser usado DENTRO del Router de React Router.
 * Se ejecuta cada vez que location.pathname o location.search cambian.
 * 
 * Solo trackea en producción (build) para no contaminar datos de desarrollo.
 */
export function useAnalyticsPageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Solo en producción
    if (import.meta.env.VITE_QUERY_ENV !== 'production') {
      return;
    }

    // Trackear el page view actual
    const fullPath = location.pathname + location.search;
    trackPageView(fullPath);
  }, [location.pathname, location.search]);
}
