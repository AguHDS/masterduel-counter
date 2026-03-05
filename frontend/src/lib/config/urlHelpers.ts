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
  return isDevelopment ? "http://localhost:3001" : "https://masterduelcounter.com";
}

/**
 * Get the frontend base URL based on environment
 * @returns Frontend URL (localhost:5173 in dev, masterduelcounter.com in prod)
 */
export function getFrontendUrl(): string {
  return isDevelopment ? "http://localhost:5173" : "https://masterduelcounter.com";
}
