import { type Archetype } from '../api/archetypeApi';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SearchResultsProps {
  results: Archetype[];
  loading: boolean;
  error: string | null;
  onSelectArchetype: (archetype: Archetype) => void;
}

export const SearchResults = ({
  results,
  loading,
  error,
  onSelectArchetype
}: SearchResultsProps) => {
  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-blue-600 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
        <div className="p-4 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Search className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-blue-300">Searching...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-red-600 rounded-xl shadow-2xl z-50">
        <div className="p-4">
          <div className="flex items-center space-x-2 text-red-400">
            <XCircle className="w-5 h-5" />
            <span>Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-blue-600 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
      <div className="p-2">
        <div className="px-3 py-2 text-xs text-blue-400 border-b border-blue-800/50 mb-2">
          Found {results.length} archetype{results.length !== 1 ? 's' : ''}
        </div>
        
        <div className="space-y-1">
          {results.map((archetype) => (
            <button
              key={archetype.id}
              onClick={() => onSelectArchetype(archetype)}
              className="w-full text-left p-3 rounded-lg hover:bg-blue-900/30 transition-colors duration-150 flex items-center justify-between group"
            >
              <div className="flex-1">
                <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                  {archetype.name}
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1">
                    {archetype.registered ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">Registered</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-red-400">Not registered</span>
                      </>
                    )}
                  </div>
                  {archetype.pending_requests > 0 && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-yellow-400">
                        {archetype.pending_requests} request{archetype.pending_requests !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-700/50">
                ID: {archetype.id}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};