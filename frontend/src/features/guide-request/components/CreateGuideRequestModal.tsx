import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Loader2 } from "lucide-react";
import { useCreateGuideRequest } from "../hooks/useGuideRequests";
import type { GuideRequestGuideType } from "../types/guideRequest.types";
import { searchArchetypes } from "@/features/archetypes/api/archetypesApi";
import type { Archetype } from "@/features/archetypes/types";

interface CreateGuideRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGuideRequestModal: React.FC<CreateGuideRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [guideType, setGuideType] = useState<GuideRequestGuideType>("COUNTER");
  const [archetypeSearch, setArchetypeSearch] = useState("");
  const [archetypeResults, setArchetypeResults] = useState<Archetype[]>([]);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const createMutation = useCreateGuideRequest();

  const handleArchetypeSearch = useCallback(async (query: string) => {
    setArchetypeSearch(query);
    setSelectedArchetype(null);
    if (query.trim().length < 2) {
      setArchetypeResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchArchetypes(query, 10);
      const archetypes = res?.data?.archetypes ?? [];
      setArchetypeResults(archetypes);
      setShowDropdown(archetypes.length > 0);
    } catch {
      setArchetypeResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectArchetype = (archetype: Archetype) => {
    setSelectedArchetype(archetype);
    setArchetypeSearch(archetype.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!selectedArchetype) {
      setError("Please select an archetype.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        archetypeId: selectedArchetype.id,
        guideType,
      });
      // Reset
      setTitle("");
      setDescription("");
      setArchetypeSearch("");
      setSelectedArchetype(null);
      setGuideType("COUNTER");
      setError("");
      onClose();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to create request.";
      setError(msg);
    }
  };

  const handleClose = useCallback(() => {
    setError("");
    onClose();
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, handleClose]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-[502]" />

      <div className="fixed inset-0 z-[503] flex items-center justify-center p-4">
        <div className="bg-[#1c1f2e] rounded-xl shadow-2xl w-full max-w-xl border border-[#c2901c]/30">
        <div className="flex items-center justify-between p-5 border-b border-[#c2901c]/20">
          <h2 className="text-white font-semibold text-lg">Request a Guide</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="What guide do you need?"
              className="w-full bg-[#252836] border border-[#c2901c]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#c2901c]/50 transition-colors"
            />
            <p className="text-slate-500 text-xs mt-1 text-right">{title.length}/100</p>
          </div>

          <div className="relative">
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Archetype <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={archetypeSearch}
                onChange={(e) => handleArchetypeSearch(e.target.value)}
                placeholder="Search archetype…"
                className="w-full bg-[#252836] border border-[#c2901c]/20 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#c2901c]/50 transition-colors"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c2901c] animate-spin" />
              )}
            </div>
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-[#252836] border border-[#c2901c]/20 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {archetypeResults.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelectArchetype(a)}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#c2901c]/10 transition-colors"
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            )}
            {selectedArchetype && (
              <p className="text-emerald-400 text-xs mt-1">
                ✓ {selectedArchetype.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Guide Type
            </label>
            <div className="flex gap-2">
              {(["COUNTER", "DECK"] as GuideRequestGuideType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGuideType(type)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    guideType === type
                      ? "bg-[#c2901c] border-[#c2901c] text-black"
                      : "bg-[#252836] border-[#c2901c]/20 text-slate-300 hover:border-[#c2901c]/40"
                  }`}
                >
                  {type === "COUNTER" ? "Counter Guide" : "Deck Guide"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Description{" "}
              <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Describe what you want in the guide…"
              className="w-full bg-[#252836] border border-[#c2901c]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#c2901c]/50 transition-colors resize-none"
            />
            <p className="text-slate-500 text-xs mt-1 text-right">
              {description.length}/500
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg border border-[#c2901c]/20 text-slate-300 text-sm hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-2.5 rounded-lg bg-[#c2901c] text-black text-sm font-semibold hover:bg-[#d4a534] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Submit Request
            </button>
          </div>
        </form>
        </div>
      </div>
    </>,
    document.body,
  );
};
