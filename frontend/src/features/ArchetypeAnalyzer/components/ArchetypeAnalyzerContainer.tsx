import { useState } from "react";
import { Layers } from "lucide-react";
import { Search } from "@/layouts/Search";

export const ArchetypeAnalyzerContainer = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl shadow-2xl border border-blue-700 overflow-hidden flex flex-col min-h-[600px]">
      <Search searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-br from-blue-800 to-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-blue-600">
              <Layers className="w-10 h-10 text-blue-300" />
            </div>
            <p className="text-blue-200 text-lg font-medium">
              Card collection will appear here
            </p>
            <p className="text-blue-400 text-sm">
              Use the search bar above to find your favorite cards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
