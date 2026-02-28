import { createAuthClient } from "better-auth/react";
import { getBackendUrl } from "@/lib/config/urlHelpers";

export const authClient = createAuthClient({
  baseURL: getBackendUrl(),
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession } = authClient;
