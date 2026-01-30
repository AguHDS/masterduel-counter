import { createAuthClient } from "better-auth/react";
import { getBackendUrl } from "@/lib/config/urlHelpers";

export const authClient = createAuthClient({
  baseURL: getBackendUrl(),
});

export const { useSession } = authClient;
