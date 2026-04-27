import { useEffect, useRef } from "react";
import ChainBadgeImg from "@/assets/chaincircle.webp";
import { CHAIN_NUMBER_OPTIONS } from "../../../utils/comboStepEditorUtils";

interface ChainNumberPickerProps {
  value?: number | null;
  isOpen: boolean;
  variant: "main" | "side";
  onToggle: () => void;
  onSelect: (chainNumber: number | null) => void;
  onClose: () => void;
}

/**
 * Chain number picker for marking cards' position in the yugioh chain sequence
 */
export const ChainNumberPicker = ({
  value,
  isOpen,
  variant,
  onToggle,
  onSelect,
  onClose,
}: ChainNumberPickerProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current?.contains(event.target as Node)) {
        return;
      }

      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const hasValue = value != null;
  const triggerClassName = hasValue
    ? variant === "main"
      ? "w-[24px] h-[24.5px] bg-center bg-cover bg-no-repeat text-cyan-100 text-[19px] font-bold flex items-center justify-center"
      : "w-[15px] h-[15px] bg-center bg-cover bg-no-repeat text-cyan-100 text-[8px] font-bold flex items-center justify-center"
    : variant === "main"
      ? "px-1 py-0.5 text-[11px] font-bold bg-black/70 text-blue-400 hover:text-blue-300"
      : "rounded-full border border-blue-400 bg-black/70 text-blue-300 text-[8px] w-4 h-3.5 hover:bg-blue-700/80 hover:text-white";

  return (
    <div className="absolute bottom-0 left-0 z-[2]">
      <button
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className={triggerClassName}
        style={hasValue ? { backgroundImage: `url(${ChainBadgeImg})` } : undefined}
        title="Set chain number"
      >
        {hasValue ? value : variant === "main" ? "chain?" : "⛓"}
      </button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-0 mb-1 bg-slate-900 border border-blue-500/50 rounded shadow-xl z-50 p-2"
          style={{ minWidth: "130px" }}
        >
          <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto">
            <button
              onClick={() => onSelect(null)}
              className="col-span-5 text-xs text-red-400 hover:bg-slate-700 rounded px-1.5 py-1"
            >
              ✕ Clear
            </button>

            {CHAIN_NUMBER_OPTIONS.map((chainNumber) => (
              <button
                key={chainNumber}
                onClick={() => onSelect(chainNumber)}
                className={`text-xs rounded px-1.5 py-1 ${
                  value === chainNumber
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                {chainNumber}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};