import { Plus } from "lucide-react";

interface EmptyArchetypeViewProps {
  archetypeName: string;
  isAuthenticated: boolean;
  onCreateInstance: () => void;
}

export const EmptyArchetypeView = ({
  archetypeName,
  isAuthenticated,
  onCreateInstance,
}: EmptyArchetypeViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-blue-300 text-lg">
        No guides created yet for {archetypeName}
      </div>
      {isAuthenticated && (
        <button
          onClick={onCreateInstance}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Be the first to create a guide!</span>
        </button>
      )}
    </div>
  );
};
