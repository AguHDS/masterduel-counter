import { useState, useEffect, useCallback } from "react";
import { searchArchetypes, type Archetype } from "../api/archetypeApi";

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
  const [results, setResults] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState("");

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setLastSearch("");
        return;
      }

      setLoading(true);
      setError(null);
      setLastSearch(query);

      try {
        const response = await searchArchetypes(query, limit);
        setResults(response.data.archetypes);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to search archetypes",
        );
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  // Debounce to avoid excessive calls
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== lastSearch) {
        performSearch(searchQuery);
      }
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, debounceDelay, lastSearch, performSearch]);

  useEffect(() => {
    if (!searchQuery.trim() && results.length > 0) {
      setResults([]);
      setLastSearch("");
    }
  }, [searchQuery, results.length]);

  return {
    results,
    loading,
    error,
    lastSearch,
    performSearch: () => performSearch(searchQuery),
  };
};
