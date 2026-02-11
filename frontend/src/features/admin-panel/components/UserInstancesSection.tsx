import { Trash2, Heart, Calendar } from "lucide-react";
import { useUserInstances, useDeleteUserInstance } from "../hooks/useAdminData";
import type { UserInstance } from "../types/adminPanelTypes";

interface UserInstancesSectionProps {
  userId: string;
}

export const UserInstancesSection = ({ userId }: UserInstancesSectionProps) => {
  const { data: instances, isLoading, error } = useUserInstances(userId);
  const deleteUserInstanceMutation = useDeleteUserInstance();

  const handleDeleteInstance = async (instanceId: number) => {
    if (!confirm("Are you sure you want to delete this instance?")) {
      return;
    }

    try {
      await deleteUserInstanceMutation.mutateAsync({
        userId,
        instanceId: instanceId.toString(),
      });
    } catch (error) {
      alert("Failed to delete instance");
      console.error("Delete instance error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-300">
        Error loading instances
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-blue-800/30 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-300 mb-3">
        User Instances ({instances?.length || 0})
      </h3>
      {instances && instances.length > 0 ? (
        <div className="space-y-3">
          {instances.map((instance: UserInstance) => (
            <div
              key={instance.id}
              className="p-4 bg-slate-900/50 rounded border border-blue-900/30 hover:border-blue-800/50 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 flex-1">
                  {instance.headerCardImageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={instance.headerCardImageUrl}
                        alt={instance.headerCardName || "Card"}
                        className="w-16 h-16 object-cover rounded border border-blue-900/50"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white mb-1">
                      {instance.title}
                    </h4>
                    <p className="text-sm text-blue-300 mb-2">
                      {instance.archetypeName}
                    </p>
                    {instance.generalTip && (
                      <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                        {instance.generalTip}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-blue-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {instance.likes} likes
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Created: {new Date(instance.created_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>
                        Updated: {new Date(instance.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteInstance(instance.id)}
                  className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete instance"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-blue-400">No instances found for this user</p>
        </div>
      )}
    </div>
  );
};
