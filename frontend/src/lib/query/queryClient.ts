import { QueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import { getQueryDefaults } from "./defaults";
import { env } from "../config/env";

const queryEnv = import.meta.env.VITE_QUERY_ENV;

export const queryClient = new QueryClient({
  defaultOptions: {
    ...getQueryDefaults(queryEnv),
    queries: {
      ...getQueryDefaults(queryEnv).queries,
      // Global error handler for queries
      throwOnError: false,
      // Log errors to Sentry
      onError: (error) => {
        console.error('Query error:', error);
        if (env.isProduction) {
          Sentry.captureException(error, {
            tags: {
              type: 'react-query-error',
              errorType: 'query',
            },
          });
        }
      },
    },
    mutations: {
      ...getQueryDefaults(queryEnv).mutations,
      // Global error handler for mutations
      onError: (error) => {
        console.error('Mutation error:', error);
        if (env.isProduction) {
          Sentry.captureException(error, {
            tags: {
              type: 'react-query-error',
              errorType: 'mutation',
            },
          });
        }
      },
    },
  },
});

export { QueryClient };
