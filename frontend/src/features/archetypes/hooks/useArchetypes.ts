import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, QUERY_STALE_TIME } from "@/lib/query";
import {
  getArchetypeWithHeaderCard,
  searchArchetypes,
} from "../api/archetypesApi";
import type { SearchResponse } from "../types";
import type { Archetype } from "../types";

/**
 * Hook to search archetypes
 * Uses SHORT stale time for real-time search experience
 */
export const useSearchArchetypes = (
  searchQuery: string,
  limit: number = 50,
) => {
  return useQuery<SearchResponse>({
    queryKey: queryKeys.archetypes.search(searchQuery, limit),
    queryFn: () => searchArchetypes(searchQuery, limit),
    staleTime: QUERY_STALE_TIME.SHORT,
    enabled: searchQuery.trim().length > 0,
  });
};

interface UseArchetypeSearchProps {
  searchQuery: string;
  debounceDelay?: number;
  limit?: number;
}

export const useArchetypeSearch = ({
  searchQuery,
  debounceDelay = 300,
  limit = 50,
}: UseArchetypeSearchProps) => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [searchQuery, debounceDelay]);

  // Use TanStack Query hook with debounced query
  const { data, isLoading, error } = useSearchArchetypes(debouncedQuery, limit);

  const results: Archetype[] = data?.data?.archetypes || [];

  return {
    results,
    loading: isLoading,
    error: error?.message || null,
  };
};

/**
 * Hook to get archetype with header card
 * Uses LONG stale time since header cards rarely change
 */
export const useArchetypeWithHeader = (archetypeId: number | undefined) => {
  return useQuery({
    queryKey: queryKeys.archetypes.withHeader(archetypeId!),
    queryFn: () => getArchetypeWithHeaderCard(archetypeId!),
    staleTime: QUERY_STALE_TIME.LONG,
    enabled: !!archetypeId,
  });
};
