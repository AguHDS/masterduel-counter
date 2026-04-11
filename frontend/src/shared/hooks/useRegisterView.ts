import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { guideInstancesApi } from "@/lib/http/guideInstancesApi";

const VIEW_EXPIRATION_TIME = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

/**
 * Hook to register a view for an instance
 * Uses localStorage to avoid duplicate requests from the same browser.
 * The real 12h cooldown is enforced by the backend.
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
        // Check if view was already registered for this instance in this session
        const storageKey = `view_registered_${instanceId}`;
        const lastViewedStr = localStorage.getItem(storageKey);

        if (lastViewedStr) {
          const lastViewed = parseInt(lastViewedStr, 10);
          const now = Date.now();

          // If less than VIEW_EXPIRATION_TIME has passed, don't register
          if (now - lastViewed < VIEW_EXPIRATION_TIME) {
            hasRegisteredRef.current[instanceId] = true;
            return;
          }
        }

        // Register the view
        await guideInstancesApi.registerView(instanceId);

        // Store the timestamp in localStorage
        localStorage.setItem(storageKey, Date.now().toString());
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
