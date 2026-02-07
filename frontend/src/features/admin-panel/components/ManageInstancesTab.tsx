import { useState } from "react";
import { Trash2, User, Calendar, AlertCircle } from "lucide-react";
import type { Publication } from "../types/adminPanelTypes";

interface ManageInstancesTabProps {
  // Este componente ahora será para gestión global de instancias si es necesario
  // O podemos reutilizarlo para mostrar instancias de un usuario específico
  publications: Publication[];
  onRefresh: () => void;
}

export const ManageInstancesTab = ({
  publications,
  onRefresh,
}: ManageInstancesTabProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);

  const handleDelete = async (instanceId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this instance? This action cannot be undone.",
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      // Nota: Necesitamos userId para eliminar una instancia
      // Esta funcionalidad se maneja mejor desde ManageAccountsTab
      alert("Please delete instances from the user management tab");
      setSelectedInstance(null);
      onRefresh();
    } catch (error) {
      alert("Failed to delete instance");
    } finally {
      setLoading(false);
    }
  };

  if (publications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-4">
          <AlertCircle className="text-blue-400" size={48} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Instances Management
        </h3>
        <p className="text-blue-300 max-w-md mx-auto">
          To manage user instances, go to "Manage Accounts" tab and click on the
          package icon next to each user.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border border-blue-800/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-800/30 bg-blue-950/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">
                  Author
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">
                  Content Preview
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {publications.map((publication) => (
                <tr
                  key={publication.id}
                  className={`border-b border-blue-900/20 hover:bg-blue-950/30 transition-colors cursor-pointer ${
                    selectedInstance === publication.id ? "bg-blue-950/40" : ""
                  }`}
                  onClick={() => setSelectedInstance(publication.id)}
                >
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">
                      {publication.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-blue-300">
                      <User size={16} />
                      <span>
                        {publication.profiles?.name ||
                          publication.profiles?.email ||
                          "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-blue-300">
                      <Calendar size={16} />
                      {new Date(publication.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-blue-300/80 line-clamp-2 max-w-md">
                      {publication.content}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(publication.id);
                        }}
                        disabled={loading}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 opacity-50 cursor-not-allowed"
                        title="Delete instance (use Manage Accounts tab)"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {publications.length === 0 && (
        <div className="text-center py-12 text-blue-300">
          No instances found
        </div>
      )}

      {selectedInstance && (
        <div className="bg-gradient-to-br from-slate-900/50 to-purple-900/20 border border-yellow-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4 border-b border-yellow-600/30 pb-2">
            Selected Instance Details
          </h3>
          {publications.find((p) => p.id === selectedInstance) && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-blue-300 font-medium">ID:</label>
                <p className="text-white mt-1">{selectedInstance}</p>
              </div>
              <div>
                <label className="text-sm text-blue-300 font-medium">
                  Title:
                </label>
                <p className="text-white mt-1">
                  {publications.find((p) => p.id === selectedInstance)?.title}
                </p>
              </div>
              <div>
                <label className="text-sm text-blue-300 font-medium">
                  Full Content:
                </label>
                <p className="text-blue-200 mt-1 bg-slate-900/50 p-4 rounded border border-blue-900/30">
                  {publications.find((p) => p.id === selectedInstance)?.content}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
