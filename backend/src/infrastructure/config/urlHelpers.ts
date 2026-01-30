import config from "@/infrastructure/config/environmentVars";

/**
 * Returns frontend URL based on the current environment
 * - Development: http://localhost:5173 (or configured port)
 * - Production: https://masterduelcounter.com
 */
export function getFrontendUrl(): string {
  if (config.nodeEnv === "production") {
    return "https://masterduelcounter.com";
  }
  return `http://localhost:${config.portFrontend}`;
}

/**
 * Returns the backend URL based on the current environment
 * - Development: http://localhost:3001 (or configured port)
 * - Production: https://masterduelcounter.com/api
 */
export function getBackendUrl(): string {
  if (config.nodeEnv === "production") {
    return "https://masterduelcounter.com/api";
  }
  return `http://localhost:${config.portBackend}`;
}
