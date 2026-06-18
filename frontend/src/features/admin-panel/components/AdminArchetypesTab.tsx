import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/http/axiosClient";
import { Search, Plus, X, HelpCircle, Pencil, Check } from "lucide-react";
import { InfoModal } from "@/shared/components/info/components/InfoModal";
import type { Archetype } from "@/features/archetypes/types";

interface ArchetypesResponse {
  success: boolean;
  archetypes: Archetype[];
}

/** Search, rename, delete and add archetypes to the system */
export const AdminArchetypesTab = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "archetypes", search],
    queryFn: async () => {
      const res = await axiosClient.get<ArchetypesResponse>("/api/admin/archetypes", {
        params: search ? { search } : {},
      });
      return res.data.archetypes ?? [];
    },
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      await axiosClient.post("/api/admin/archetypes", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "archetypes"] });
      setNewName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.delete(`/api/admin/archetypes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "archetypes"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      await axiosClient.put(`/api/admin/archetypes/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "archetypes"] });
      setEditId(null);
      setEditName("");
    },
  });

  const archetypes = data ?? [];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archetypes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg outline-none focus:border-amber-500/70"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New archetype name..."
            className="w-48 px-4 py-2 bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg outline-none focus:border-amber-500/70"
          />
          <button
            onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
            disabled={!newName.trim() || createMutation.isPending}
            className="flex items-center gap-1 px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <button
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg text-xs font-semibold transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
      </div>

      {createMutation.isError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 text-sm">{(createMutation.error as Error)?.message || "Failed to create archetype"}</p>
        </div>
      )}

      {deleteMutation.isError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 text-sm">{(deleteMutation.error as Error)?.message || "Failed to delete archetype"}</p>
        </div>
      )}

      {updateMutation.isError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 text-sm">{(updateMutation.error as Error)?.message || "Failed to rename archetype"}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
        {archetypes.map((archetype) => (
          <div
            key={archetype.id}
            className="flex items-center justify-between px-4 py-2.5 bg-slate-800/60 border border-slate-600/30 rounded-lg group hover:border-slate-500/50 transition-colors"
          >
            {editId === archetype.id ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && editName.trim()) {
                      updateMutation.mutate({ id: archetype.id, name: editName.trim() });
                    } else if (e.key === "Escape") {
                      setEditId(null);
                    }
                  }}
                  className="flex-1 bg-slate-700 border border-amber-500/40 text-slate-200 text-sm rounded px-2 py-1 outline-none"
                  autoFocus
                />
                <button
                  onClick={() => editName.trim() && updateMutation.mutate({ id: archetype.id, name: editName.trim() })}
                  className="p-1 text-green-400 hover:text-green-300"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditId(null)} className="p-1 text-slate-500 hover:text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-slate-200 text-sm">{archetype.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditId(archetype.id); setEditName(archetype.name); }}
                    className="p-1 text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="Rename archetype"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(archetype.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete archetype"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {!isLoading && archetypes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-sm">No archetypes found</p>
          </div>
        )}
      </div>

      <InfoModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Archetypes Help">
        <div className="space-y-5 text-sm">
          <div>
            <h3 className="text-amber-400 font-bold text-base mb-2">What are Archetypes?</h3>
            <p>Archetypes are the deck/card families in Yu-Gi-Oh! (e.g., "HERO", "Branded", "Blue-Eyes"). They're used across the site for searching, creating guides, and linking tier list entries.</p>
            <p className="mt-1 text-slate-400">The list is automatically populated from YGOProDeck when users search for archetypes.</p>
          </div>
          <div>
            <h3 className="text-amber-400 font-bold text-base mb-2">Adding an Archetype</h3>
            <p>Use the <strong>"Add"</strong> button to create an archetype that doesn't exist in YGOProDeck. Once added, it appears in the MainSearch and users can create guides for it.</p>
          </div>
          <div>
            <h3 className="text-amber-400 font-bold text-base mb-2">Renaming an Archetype</h3>
            <p>Hover over an archetype and click the <strong>pencil icon</strong> to rename it. Guides, drafts, and guide requests still work — they reference the archetype by numeric ID. The tier list linked entries are automatically updated.</p>
            <p className="mt-1 text-slate-400">You cannot rename to a name that already exists.</p>
          </div>
          <div>
            <h3 className="text-amber-400 font-bold text-base mb-2">Deleting an Archetype</h3>
            <p>Hover over an archetype and click <strong>"X"</strong> to delete it. <strong>Only works if the archetype has no guides associated.</strong></p>
          </div>
          <div>
            <h3 className="text-amber-400 font-bold text-base mb-2">Relationship with Tier List</h3>
            <p>In the Tier List admin tab, you can <strong>link</strong> a deck entry to an archetype from this list.</p>
          </div>
        </div>
      </InfoModal>
    </div>
  );
};
