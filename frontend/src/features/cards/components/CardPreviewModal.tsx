import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Crop, Image as ImageIcon, X } from "lucide-react";
import type { Card } from "../types";

type PreviewTab = "CARD" | "BACKGROUND";

interface CardPreviewModalProps {
  isOpen: boolean;
  card: Card | null;
  onClose: () => void;
}

export const CardPreviewModal = ({
  isOpen,
  card,
  onClose,
}: CardPreviewModalProps) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>("CARD");

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("CARD");
    }
  }, [isOpen, card?.id]);

  const cardImage = useMemo(() => {
    return card?.imageUrlExternal || card?.imageUrlSmallExternal || "";
  }, [card]);

  const backgroundImage = useMemo(() => {
    return card?.imageUrlCroppedExternal || cardImage;
  }, [card, cardImage]);

  if (!isOpen || !card) return null;

  const imageToDisplay = activeTab === "CARD" ? cardImage : backgroundImage;

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-[520] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.1),transparent_30%),rgba(2,6,23,0.78)] backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className="fixed z-[530] left-1/2 top-1/2 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 px-3 sm:px-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative max-h-[calc(100vh-2rem)] overflow-auto rounded-[20px] border border-blue-500/40 bg-gradient-to-br from-[#090d18] via-[#13182b] to-[#190f30] shadow-[0_0_44px_rgba(37,99,235,0.18)] sm:max-h-[calc(100vh-3rem)] sm:rounded-[24px]">
          <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_36%)]" />
          <div className="pointer-events-none absolute inset-x-4 top-4 h-24 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />

          <div className="relative z-10 flex items-start justify-between gap-3 border-b border-slate-700/70 bg-slate-950/70 px-4 py-4 backdrop-blur-xl sm:items-center sm:px-5">
            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">{card.name}</h2>
              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                Preview card art and cropped background
              </p>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-full p-2 text-slate-400 hover:bg-slate-800/70 hover:text-white"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative z-10 flex justify-center px-4 pt-4 sm:px-5 sm:pt-5">
            <div className="inline-flex w-full max-w-md rounded-xl border border-slate-700/80 bg-slate-950/60 p-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setActiveTab("CARD")}
                className={`inline-flex w-1/2 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "CARD"
                    ? "bg-sky-500/20 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.22)]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Card
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("BACKGROUND")}
                className={`inline-flex w-1/2 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "BACKGROUND"
                    ? "bg-violet-500/20 text-violet-200 shadow-[0_0_16px_rgba(168,85,247,0.22)]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Crop className="h-4 w-4" />
                Background
              </button>
            </div>
          </div>

          <div className="relative z-10 p-4 sm:p-5">
            <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-[18px] border border-slate-700/70 bg-slate-950/70 p-3 shadow-[0_16px_42px_rgba(2,6,23,0.36)] sm:min-h-[420px] sm:p-4">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_60%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.2)_1px,transparent_1px)] bg-[size:46px_46px] opacity-30" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:9px_9px] opacity-20" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(248,250,252,0.8)_1px,transparent_1.3px)] bg-[size:57px_57px] opacity-25" />

              {imageToDisplay ? (
                <img
                  src={imageToDisplay}
                  alt={`${card.name} ${
                    activeTab === "CARD" ? "card" : "background"
                  } preview`}
                  className="relative z-10 max-h-[62vh] w-auto max-w-full rounded-xl object-contain shadow-[0_20px_60px_rgba(2,6,23,0.5)] sm:max-h-[70vh]"
                />
              ) : (
                <p className="relative z-10 text-slate-300">Image not available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};