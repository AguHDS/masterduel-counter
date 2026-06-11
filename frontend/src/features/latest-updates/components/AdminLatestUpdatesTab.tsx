import { useState } from "react";
import { Plus, Pencil, Trash2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { latestUpdatesApi } from "../api/latestUpdatesApi";
import { useAllLatestUpdates } from "../hooks/useAllLatestUpdates";
import type { LatestUpdate } from "../types/latestUpdatesTypes";
import { renderContent } from "../lastestUpdatesUtils";

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

const ADMIN_PAGE_SIZE = 15;

/** Component for displaying and managing latest updates in the admin panel */
export const AdminLatestUpdatesTab = () => {
  const [page, setPage] = useState(1);
  const { data: paginated, isLoading, error: fetchError } = useAllLatestUpdates(page, ADMIN_PAGE_SIZE);
  const [editingPost, setEditingPost] = useState<LatestUpdate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["latestUpdates"] });
  };

  const totalPages = paginated?.totalPages ?? 0;

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Latest Updates
          {paginated && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({paginated.total} total)
            </span>
          )}
        </h2>
        <button
          onClick={() => {
            setEditingPost(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {(error || fetchError) && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300">{error || "Failed to load updates"}</p>
        </div>
      )}

      {showForm && (
        <LatestUpdateForm
          post={editingPost}
          onSaved={() => {
            setShowForm(false);
            setEditingPost(null);
            invalidate();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingPost(null);
          }}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
        </div>
      ) : !paginated || paginated.posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No updates yet. Create your first post!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {paginated.posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start justify-between gap-4 p-4 bg-black/40 border border-[#30303b] rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-yellow-200 font-semibold text-base">
                  {post.title}
                </h3>
                <div
                  className="text-gray-400 text-sm line-clamp-2 mt-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_li]:mb-0.5"
                  dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
                />
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditingPost(post);
                    setShowForm(true);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm("Delete this post?")) {
                      try {
                        await latestUpdatesApi.deleteLastestUpdate(post.id);
                        invalidate();
                      } catch {
                        setError("Failed to delete post");
                      }
                    }
                  }}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-slate-600 text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? "bg-[#c2901c] text-black font-bold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface LatestUpdateFormProps {
  post: LatestUpdate | null;
  onSaved: () => void;
  onCancel: () => void;
}

const LatestUpdateForm = ({ post, onSaved, onCancel }: LatestUpdateFormProps) => {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const insertFormat = (before: string, after: string) => {
    const textarea = document.getElementById(
      "update-content",
    ) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent =
      content.substring(0, start) + before + selected + after + content.substring(end);
    setContent(newContent);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setFormError("Title and content are required");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      if (post) {
        await latestUpdatesApi.updateLastestUpdate(post.id, { title: title.trim(), content: content.trim() });
      } else {
        await latestUpdatesApi.CreateLatestUpdate({ title: title.trim(), content: content.trim() });
      }
      onSaved();
    } catch (_err) {
      setFormError("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-black/40 border border-blue-900/50 rounded-lg">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title..."
        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />

      <div className="flex gap-1 flex-wrap">
        {[
          { label: "B", before: "<b>", after: "</b>", className: "font-bold" },
          { label: "I", before: "<i>", after: "</i>", className: "italic" },
          { label: "H1", before: "<h1>", after: "</h1>", className: "" },
          { label: "H2", before: "<h2>", after: "</h2>", className: "" },
          { label: "H3", before: "<h3>", after: "</h3>", className: "" },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => insertFormat(btn.before, btn.after)}
            className={`px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors ${btn.className}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <textarea
        id="update-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post content here... Use the toolbar above for formatting."
        rows={10}
        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-y font-mono text-sm"
      />

      {formError && <p className="text-red-400 text-sm">{formError}</p>}

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : post ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
};
