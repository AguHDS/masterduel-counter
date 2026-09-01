import { Newspaper, ChevronDown } from "lucide-react";
import { useLatestUpdates } from "../hooks/useLatestUpdates";
import { LatestUpdateCard } from "./LatestUpdateCard";
import { LatestUpdatesModal } from "./LatestUpdatesModal";
import { useState, useRef, useEffect, useCallback } from "react";
import type { LatestUpdate } from "../types/latestUpdatesTypes";

/** Component for containing the latest updates cards */
export const LatestUpdatesContainer = () => {
  const { data: posts, isLoading, error } = useLatestUpdates();
  const [selectedPost, setSelectedPost] = useState<LatestUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"post" | "all">("post");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // For collapsing the updates section and animating the height
  const updateHeight = useCallback(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    updateHeight();
  }, [posts, updateHeight]);

  const handleSeeMore = (post: LatestUpdate) => {
    setSelectedPost(post);
    setActiveTab("post");
    setIsModalOpen(true);
  };

  const handleSeeAll = () => {
    setSelectedPost(null);
    setActiveTab("all");
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-black/70 border-t border-slate-600/40 px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-yellow-100">
              Latest Updates
            </h2>
          </div>
          <div className="text-gray-400 text-sm">Loading updates...</div>
        </div>
      </div>
    );
  }

  if (error || !posts || posts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full">
        <div className="bg-black/70 border-t border-slate-600/40 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Newspaper className="h-5 w-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-yellow-100">
                Latest Updates
              </h2>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`} />
            </div>
            <button
              onClick={handleSeeAll}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              See All Updates
            </button>
          </div>

          <div
            ref={contentRef}
            className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{ maxHeight: isCollapsed ? 0 : `${contentHeight}px` }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {posts.slice(0, 3).map((post) => (
                <LatestUpdateCard
                  key={post.id}
                  post={post}
                  onSeeMore={handleSeeMore}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <LatestUpdatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialPost={selectedPost}
        initialTab={activeTab}
      />
    </>
  );
};
