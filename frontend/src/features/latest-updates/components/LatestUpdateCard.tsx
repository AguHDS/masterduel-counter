import { Calendar } from "lucide-react";
import type { LatestUpdate } from "../types/latestUpdatesTypes";
import { renderContent } from "../lastestUpdatesUtils";

interface LatestUpdateCardProps {
  post: LatestUpdate;
  onSeeMore: (post: LatestUpdate) => void;
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

/** Component for displaying a single latest update card */
export const LatestUpdateCard = ({ post, onSeeMore }: LatestUpdateCardProps) => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-black border border-[#30303b] hover:border-slate-600 transition-all rounded-lg">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-yellow-200 font-semibold text-base line-clamp-1">
          {post.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 shrink-0">
          <Calendar className="w-3 h-3" />
          <span className="text-xs">{formatDate(post.createdAt)}</span>
        </div>
      </div>

      <div
        className="text-gray-300 text-sm line-clamp-3 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_b]:text-yellow-100 [&_strong]:text-yellow-100 [&_i]:text-gray-300 [&_em]:text-gray-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_li]:mb-0.5"
        dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
      />

      <button
        onClick={() => onSeeMore(post)}
        className="self-start mt-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        See more
      </button>
    </div>
  );
};
