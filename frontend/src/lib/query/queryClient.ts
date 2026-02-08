import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import { getQueryDefaults } from "./defaults";
import { env } from "../config/env";

const queryEnv = import.meta.env.VITE_QUERY_ENV;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error("Query error:", error);
      if (env.isProduction) {
        Sentry.captureException(error, {
          tags: {
            type: "react-query-error",
            errorType: "query",
          },
        });
      }
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      console.error("Mutation error:", error);
      if (env.isProduction) {
        Sentry.captureException(error, {
          tags: {
            type: "react-query-error",
            errorType: "mutation",
          },
        });
      }
    },
  }),

  defaultOptions: {
    ...getQueryDefaults(queryEnv),
    queries: {
      ...getQueryDefaults(queryEnv).queries,
      throwOnError: false,
    },
    mutations: {
      ...getQueryDefaults(queryEnv).mutations,
    },
  },
});

export { QueryClient };
