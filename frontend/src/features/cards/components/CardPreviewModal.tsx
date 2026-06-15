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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
      <div className="fixed inset-0 bg-black/70 z-[500]" />

      <div
        className="fixed inset-0 z-[501] flex items-center justify-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1c1f2e] rounded-xl shadow-2xl w-full max-w-3xl border border-[#c2901c]/30 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#c2901c]/20">
            <div>
              <h2 className="text-white font-semibold text-lg">
                {card.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Preview card art and cropped background
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex border-b border-[#c2901c]/20">
            <button
              onClick={() => setActiveTab("CARD")}
              className={`flex-1 px-4 py-2.5 text-xs font-semibold tracking-wide transition-colors ${
                activeTab === "CARD"
                  ? "border-b-2 border-[#c2901c] text-[#c2901c]"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <ImageIcon className="h-4 w-4 inline mr-1.5" />
              Card
            </button>
            <button
              onClick={() => setActiveTab("BACKGROUND")}
              className={`flex-1 px-4 py-2.5 text-xs font-semibold tracking-wide transition-colors ${
                activeTab === "BACKGROUND"
                  ? "border-b-2 border-[#c2901c] text-[#c2901c]"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Crop className="h-4 w-4 inline mr-1.5" />
              Background
            </button>
          </div>

          <div className="p-5">
            <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl border border-[#c2901c]/15 bg-[#151828] p-4 sm:min-h-[420px]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(194,144,28,0.19)_1px,transparent_1px),linear-gradient(to_bottom,rgba(194,144,28,0.07)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(194,144,28,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(194,144,28,0.04)_1px,transparent_1px)] bg-[size:9px_9px] opacity-20" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(194,144,28,0.08)_1px,transparent_1.3px)] bg-[size:57px_57px] opacity-20" />
              {imageToDisplay ? (
                <img
                  src={imageToDisplay}
                  alt={`${card.name} ${
                    activeTab === "CARD" ? "card" : "background"
                  } preview`}
                  className="max-h-[60vh] w-auto max-w-full rounded-lg object-contain shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                />
              ) : (
                <p className="text-slate-500">Image not available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};
