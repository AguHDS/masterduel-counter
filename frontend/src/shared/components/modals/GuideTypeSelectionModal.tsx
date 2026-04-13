import { createPortal } from "react-dom";
import { X, BookOpen, Shield } from "lucide-react";
import type { GuideType } from "@/features/archetypes/types";

interface GuideTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: GuideType) => void;
  archetypeName: string;
}

export const GuideTypeSelectionModal = ({
  isOpen,
  onClose,
  onSelectType,
  archetypeName,
}: GuideTypeSelectionModalProps) => {
  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[460] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.08),transparent_28%),rgba(2,6,23,0.72)] backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-[470] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col overflow-hidden rounded-[24px] border border-blue-500/40 bg-gradient-to-br from-[#090d18] via-[#13182b] to-[#190f30] shadow-[0_0_44px_rgba(37,99,235,0.18)] w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_36%)]" />
        <div className="pointer-events-none absolute inset-x-4 top-4 h-24 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-700/70 bg-slate-950/70 px-5 py-4 backdrop-blur-xl">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Select Guide Type
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              For{" "}
              <span className="text-sky-300 font-semibold">
                {archetypeName}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800/70 hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {/* Counter Guide */}
          <button
            onClick={() => onSelectType("COUNTER")}
            className="group relative flex flex-col items-center text-center gap-3 overflow-hidden rounded-[18px] border border-orange-500/30 bg-slate-950/50 p-6 shadow-[0_8px_24px_rgba(2,6,23,0.3)] duration-200 hover:border-orange-400/60 hover:shadow-[0_8px_28px_rgba(249,115,22,0.15)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_60%)] opacity-0 group-hover:opacity-100" />
            <div className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-orange-500/30 bg-orange-500/10 shadow-[0_8px_20px_rgba(249,115,22,0.15)] group-hover:border-orange-400/50 group-hover:bg-orange-500/15">
              <Shield className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white">
              Counter Guide
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Counter guide focused on countering this archetype with handtraps
              and tips
            </p>
            <ul className="text-xs text-slate-500 space-y-1 text-left w-full mt-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-orange-500/60 flex-shrink-0" />
                Handtrap suggestions
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-orange-500/60 flex-shrink-0" />
                Tips for each step
              </li>
            </ul>
            <span className="mt-1px-3 py-1"></span>
          </button>

          {/* Deck Guide */}
          <button
            onClick={() => onSelectType("DECK")}
            className="group relative flex flex-col items-center text-center gap-3 overflow-hidden rounded-[18px] border border-sky-500/30 bg-slate-950/50 p-6 shadow-[0_8px_24px_rgba(2,6,23,0.3)] duration-200 hover:border-sky-400/60 hover:shadow-[0_8px_28px_rgba(59,130,246,0.15)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_60%)] opacity-0 group-hover:opacity-100" />
            <div className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-sky-500/30 bg-sky-500/10 shadow-[0_8px_20px_rgba(59,130,246,0.15)] group-hover:border-sky-400/50 group-hover:bg-sky-500/15">
              <BookOpen className="w-7 h-7 text-sky-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white">
              Deck Guide
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Deck guide with combo lines, starting hands, and deck building
            </p>
            <ul className="text-xs text-slate-500 space-y-1 text-left w-full mt-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-sky-500/60 flex-shrink-0" />
                Sample starting hands (up to 5)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-sky-500/60 flex-shrink-0" />
                Combo lines with alternative flows
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-sky-500/60 flex-shrink-0" />
                Deck builder
              </li>
            </ul>
            <span className="mt-1px-3 py-1"></span>
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};
