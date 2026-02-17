import { X } from "lucide-react";
import { useEffect } from "react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const InfoModal = ({ isOpen, onClose, title, children }: InfoModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 rounded-2xl shadow-2xl border-2 border-blue-600/50 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900/95 to-slate-900/95 backdrop-blur-sm border-b border-blue-600/50 px-6 py-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-2xl font-bold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-red-600/30 border border-blue-500/30 hover:border-red-500 text-blue-300 hover:text-red-300 transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content with custom scrollbar */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-6 py-6 custom-scrollbar">
          <div className="text-gray-300 space-y-4">
            {children}
          </div>
        </div>

        {/* Footer gradient */}
        <div className="sticky bottom-0 h-8 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none" />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
};
