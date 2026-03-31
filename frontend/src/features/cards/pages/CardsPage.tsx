import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { CardsSearch } from "../components/CardsSearch";
import { CardGrid } from "../components/CardGrid";
import { Pagination } from "../components/Pagination";
import { useCardsSearch } from "../hooks/useCardsSearch";

export const CardsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useCardsSearch({
    query: debouncedQuery,
    page: currentPage,
    enabled: debouncedQuery.length > 0,
  });

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>Cards - Masterduel Counter</title>
        <meta
          name="description"
          content="Search and explore Yu-Gi-Oh! Master Duel cards. View detailed card information and stats."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-[1500px]">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Card Search
            </h1>
            <p className="text-gray-400">
              Search through thousands of Yu-Gi-Oh! Master Duel cards
            </p>
          </div>

          <CardsSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={handleClearSearch}
          />

          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-red-400 text-lg">Failed to load cards</p>
              <p className="text-gray-500 text-sm mt-2">
                Please try again later
              </p>
            </div>
          ) : !debouncedQuery ? (
            <div className="flex flex-col items-center justify-center py-20 text-center"></div>
          ) : (
            <>
              {data && data.total > 0 && (
                <div className="mb-4 text-center text-gray-400">
                  Found {data.total} card{data.total !== 1 ? "s" : ""}
                </div>
              )}

              <CardGrid cards={data?.cards || []} isLoading={isLoading} />

              {data && data.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={data.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};
