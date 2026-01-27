import { useState, useEffect } from "react";
import { useSearchArchetypes } from "./useArchetypeQueries";
import type { Archetype } from "../api/archetypeApi";

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
