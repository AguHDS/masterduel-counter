/**
 * Google Analytics Configuration
 *
 * Este archivo centraliza la configuración de Google Analytics 4.
 * Se trackean automáticamente page views en cada cambio de ruta.
 */

// ID de medición de Google Analytics
export const GA_MEASUREMENT_ID = "G-P57LFNSW84";

// Declaración de tipos para gtag
declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js" | "set" | "consent",
      targetId: string | Date | "default" | "update",
      config?: Record<string, unknown>,
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Verifica si Google Analytics está disponible y habilitado
 */
export function isGAAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    import.meta.env.VITE_QUERY_ENV === "production" // Solo en producción
  );
}

/**
 * Trackea un page view manualmente
 * @param path - Ruta de la página (ej: /archetype/123)
 * @param title - Título de la página
 */
export function trackPageView(path: string, title?: string) {
  if (!isGAAvailable()) return;

  // Enviar page_path actualizado a la configuración
  window.gtag!("config", GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });

  // También enviar evento explícito de page_view
  window.gtag!("event", "page_view", {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

/**
 * Trackea un evento personalizado
 * @param eventName - Nombre del evento
 * @param eventParams - Parámetros del evento
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>,
) {
  if (!isGAAvailable()) return;

  window.gtag!("event", eventName, eventParams);
  console.log("[GA] Event tracked:", eventName, eventParams);
}

/**
 * Trackea un error
 * @param error - Error capturado
 * @param fatal - Si el error es fatal
 */
export function trackError(error: Error, fatal = false) {
  if (!isGAAvailable()) return;

  window.gtag!("event", "exception", {
    description: error.message,
    fatal: fatal,
  });
}
