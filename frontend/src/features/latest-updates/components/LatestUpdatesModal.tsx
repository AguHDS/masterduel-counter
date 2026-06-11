import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Newspaper,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAllLatestUpdates } from "../hooks/useAllLatestUpdates";
import type { LatestUpdate } from "../types/latestUpdatesTypes";

interface LatestUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPost: LatestUpdate | null;
  initialTab?: ModalTab;
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

const formatDateLong = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

type ModalTab = "post" | "all";

const PAGE_SIZE = 15;

/** Component for displaying a full modal with latest updates display */
export const LatestUpdatesModal = ({
  isOpen,
  onClose,
  initialPost,
  initialTab,
}: LatestUpdatesModalProps) => {
  const [activeTab, setActiveTab] = useState<ModalTab>(initialTab ?? "post");
  const [currentPost, setCurrentPost] = useState<LatestUpdate | null>(
    initialPost,
  );
  const [page, setPage] = useState(1);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { data: paginated, isLoading } = useAllLatestUpdates(page, PAGE_SIZE);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentPost(initialPost);
    setActiveTab(initialTab ?? "post");
    setPage(1);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, initialPost, initialTab, onClose]);

  if (!isOpen) return null;

  const handleSelectPost = (post: LatestUpdate) => {
    setCurrentPost(post);
    setActiveTab("post");
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const totalPages = paginated?.totalPages ?? 0;

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-1.5 p-4 pt-3 border-t border-[#c2901c]/10 shrink-0">
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
    );
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] bg-black/80"
    >
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96vw] max-w-4xl bg-[#1c1f2e] rounded-xl shadow-2xl border border-[#c2901c]/30 flex flex-col overflow-hidden"
        style={{ height: "min(90vh, 750px)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[#c2901c]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#c2901c]/10 border border-[#c2901c]/30 rounded-lg">
              <Newspaper className="w-5 h-5 text-[#c2901c]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Latest Updates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Announcements &amp; changelog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[#c2901c]/20 shrink-0">
          <button
            onClick={() => setActiveTab("post")}
            className={`px-5 py-2.5 text-xs font-semibold tracking-wide transition-colors ${
              activeTab === "post"
                ? "border-b-2 border-[#c2901c] text-[#c2901c]"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">Post</div>
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2.5 text-xs font-semibold tracking-wide transition-colors ${
              activeTab === "all"
                ? "border-b-2 border-[#c2901c] text-[#c2901c]"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">All Updates</div>
          </button>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          {activeTab === "post" && currentPost && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto scrollbar-homeAllPages flex-1">
                <div className="px-6 pt-6 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <h3 className="text-2xl font-bold text-white leading-tight tracking-wide">
                      {currentPost.title}
                    </h3>
                    <span className="text-xs text-slate-500 shrink-0 whitespace-nowrap">
                      {formatDateLong(currentPost.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="h-px mx-6 bg-gradient-to-r from-[#c2901c]/30 via-[#c2901c]/10 to-transparent" />

                <div className="px-6 py-5">
                  <div
                    className="text-slate-300 text-sm leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#c2901c] [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#c2901c] [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-[#c2901c] [&_h3]:mt-4 [&_h3]:mb-2 [&_b]:text-white [&_strong]:text-white [&_i]:text-slate-300 [&_em]:text-slate-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_li]:mb-1.5 [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-[#c2901c] [&_a]:hover:text-[#d4a534] [&_a]:underline [&_a]:underline-offset-2 [&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[#c2901c] [&_code]:text-xs [&_pre]:bg-slate-900 [&_pre]:border [&_pre]:border-slate-700/50 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_blockquote]:border-l-4 [&_blockquote]:border-[#c2901c]/40 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:bg-[#c2901c]/5 [&_blockquote]:rounded-r-lg [&_blockquote]:text-slate-400 [&_blockquote]:italic"
                    dangerouslySetInnerHTML={{ __html: currentPost.content }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "all" && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto scrollbar-homeAllPages flex-1 p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c2901c]" />
                  </div>
                ) : !paginated || paginated.posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Newspaper className="w-10 h-10 text-slate-600" />
                    <p className="text-slate-500 text-sm">No updates yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {paginated.posts.map((post, idx) => {
                      const globalIdx =
                        (page - 1) * PAGE_SIZE + idx + 1;
                      const isActive = currentPost?.id === post.id;
                      return (
                        <button
                          key={post.id}
                          onClick={() => handleSelectPost(post)}
                          className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all border ${
                            isActive
                              ? "bg-gradient-to-r from-[#c2901c]/10 to-transparent border-[#c2901c]/30"
                              : "bg-slate-900/40 border-slate-800/50 hover:border-slate-700/60 hover:bg-slate-800/40"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                              isActive
                                ? "bg-[#c2901c]/20 text-[#c2901c] border border-[#c2901c]/30"
                                : "bg-slate-800 text-slate-500 border border-slate-700/50"
                            }`}
                          >
                            {globalIdx}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                isActive
                                  ? "text-[#c2901c]"
                                  : "text-slate-200"
                              }`}
                            >
                              {post.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatDate(post.createdAt)}
                            </p>
                          </div>

                          <ChevronRight
                            className={`w-4 h-4 shrink-0 transition-all ${
                              isActive
                                ? "text-[#c2901c] translate-x-0.5"
                                : "text-slate-600"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {renderPagination()}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
