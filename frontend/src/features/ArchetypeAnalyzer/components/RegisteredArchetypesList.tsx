import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getRegisteredArchetypes, type ArchetypeWithCreator } from "../api/archetypeApi";

interface RegisteredArchetypesListProps {
  onSelectArchetype: (archetypeId: number) => void;
}

const ITEMS_PER_PAGE = 10;

export const RegisteredArchetypesList = ({ onSelectArchetype }: RegisteredArchetypesListProps) => {
  const [archetypes, setArchetypes] = useState<ArchetypeWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const loadRegisteredArchetypes = async () => {
      try {
        setLoading(true);
        const response = await getRegisteredArchetypes();
        setArchetypes(response.data.archetypes);
      } catch (err) {
        console.error("Error loading registered archetypes:", err);
        setError("Failed to load registered archetypes");
      } finally {
        setLoading(false);
      }
    };

    loadRegisteredArchetypes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-300 text-lg">Loading archetypes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  if (archetypes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-300 text-lg">No registered archetypes yet</div>
      </div>
    );
  }

  const totalPages = Math.ceil(archetypes.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArchetypes = archetypes.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="flex flex-col items-center p-8">
      {/* Título */}
      <h2 className="text-base font-semibold text-blue-400 mb-2 self-start ml-[5%]">Registered Decks</h2>
      
      {/* Contenedor exterior (90% del padre) */}
      <div className="w-[90%] bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-xl p-6">
        {/* Lista interior (95% del contenedor) */}
        <div className="w-[95%] mx-auto">
          {/* Header de la lista */}
          <div className="grid grid-cols-[60px_1fr_200px] gap-4 mb-4 pb-3 border-b border-blue-600">
            <div className="text-blue-300 font-semibold text-sm">ID</div>
            <div className="text-blue-300 font-semibold text-sm">Name</div>
            <div className="text-blue-300 font-semibold text-sm">Created by</div>
          </div>

          {/* Items de la lista */}
          <div className="space-y-2">
            {currentArchetypes.map((archetype, index) => (
              <button
                key={archetype.id}
                onClick={() => onSelectArchetype(archetype.id)}
                className="w-full grid grid-cols-[60px_1fr_200px] gap-4 p-3 bg-blue-900 hover:bg-blue-800 rounded transition-colors text-left"
              >
                <div className="text-blue-200 text-sm">{startIndex + index + 1}</div>
                <div className="text-white font-medium text-sm">{archetype.name}</div>
                <div className="text-blue-300 text-sm">
                  {archetype.created_by_username || "Unknown"}
                </div>
              </button>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-blue-300 text-sm font-medium">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
