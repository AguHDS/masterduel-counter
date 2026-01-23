import { Search as SearchIcon, Layers } from "lucide-react";

interface SearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onShowDecks?: () => void;
}

export const Search = ({
  searchQuery,
  onSearchChange,
  onShowDecks,
}: SearchProps) => {
  return (
    <div className="bg-slate-800 border-b border-blue-700 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-blue-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for cards..."
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-700 border border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-blue-400 hover:bg-slate-650"
          />
        </div>

        <button
          onClick={onShowDecks}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-medium text-sm whitespace-nowrap"
        >
          <Layers className="w-4 h-4" />
          <span>Listed Decks</span>
        </button>
      </div>
    </div>
  );
};
