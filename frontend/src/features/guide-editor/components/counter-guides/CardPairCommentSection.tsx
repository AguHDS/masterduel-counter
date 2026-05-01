import type { RefObject } from "react";

interface CardPairCommentSectionProps {
  comment?: string;
  isEditMode: boolean;
  isCommentExpanded: boolean;
  onToggleExpanded: () => void;
  onCommentChange: (value: string) => void;
  commentRef: RefObject<HTMLDivElement | null>;
  readMoreButtonHeight: number;
}

const renderCommentWithLineBreaks = (text: string) => {
  if (!text) return "No comment";

  return text.split("\n").map((line, index, lines) => (
    <span key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ));
};

/**
 * Comment editor/preview section used by CardPairItem
 */
export const CardPairCommentSection = ({
  comment,
  isEditMode,
  isCommentExpanded,
  onToggleExpanded,
  onCommentChange,
  commentRef,
  readMoreButtonHeight,
}: CardPairCommentSectionProps) => {
  return (
    <div
      ref={commentRef}
      className="flex items-center justify-center mt-2 scrollbar-homeAllPages"
    >
      {isEditMode ? (
        <div className="w-full">
          <label className="text-blue-400 font-semibold text-xs mb-0.5 block">
            Comment
          </label>
          <textarea
            value={comment || ""}
            onChange={(e) => onCommentChange(e.target.value)}
            maxLength={500}
            placeholder="Add a comment (Max. 500 characters)..."
            className="w-full px-2 py-1.5 bg-slate-700/50 text-white text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500 resize-y min-h-[60px]"
            rows={3}
          />
          <div className="text-xs text-slate-400 mt-0.5 text-right">
            {(comment || "").length}/500
          </div>
        </div>
      ) : (
        <div className="w-full pb-1 flex flex-col items-center">
          <span className="text-xs mt-2 font-semibold text-blue-400 uppercase tracking-wide">
            Comment
          </span>
          <div
            className="text-center mt-2 py-1 px-3 text-slate-300 text-[13px] w-full overflow-hidden"
            style={{
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              lineHeight: "1.3em",
              maxHeight: !isCommentExpanded ? "4.5rem" : "500px",
              transition: "max-height 0.3s ease-in-out",
              minHeight: "4.5rem",
            }}
          >
            {renderCommentWithLineBreaks(comment || "No comment")}
          </div>
          <div
            style={{ height: `${readMoreButtonHeight}px` }}
            className="flex items-center justify-center"
          >
            {comment && comment.length > 150 && (
              <button
                onClick={onToggleExpanded}
                className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1"
              >
                {isCommentExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
