const queryEnv = import.meta.env.VITE_QUERY_ENV as string | undefined;

export const env = {
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  QUERY_ENV: queryEnv,
  isDevelopment: queryEnv === 'development',
  isProduction: queryEnv === 'production',
} as const;
