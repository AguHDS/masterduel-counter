import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { guideInstancesApi } from "@/lib/http/guideInstancesApi";

/**
 * Hook to register a view for an instance
 * The 12h cooldown is enforced by the backend using cookies and fingerprinting.
 * Backend responds with { counted: true/false } to indicate if view was counted.
 * 
 * @param instanceId - The ID of the instance to track views for
 * @param archetypeId - The ID of the archetype (needed to invalidate the query)
 */
export const useRegisterView = (instanceId: number | undefined, archetypeId: number | undefined) => {
  const hasRegisteredRef = useRef<{ [key: number]: boolean }>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!instanceId || !archetypeId || hasRegisteredRef.current[instanceId]) return;

    const registerView = async () => {
      try {
        // Register the view - backend handles cooldown logic
        await guideInstancesApi.registerView(instanceId);
        hasRegisteredRef.current[instanceId] = true;

        // Invalidate the query to refetch updated view count
        queryClient.invalidateQueries({
          queryKey: ["userInstance", archetypeId, instanceId],
        });
      } catch (error) {
        console.error("Error registering view:", error);
      }
    };

    // Register view after a small delay to ensure the page has loaded
    const timeoutId = setTimeout(registerView, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [instanceId, archetypeId, queryClient]);
};
