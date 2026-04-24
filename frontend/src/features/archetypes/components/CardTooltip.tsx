import { useState, useRef, useEffect, useMemo, useId } from "react";
import { createPortal } from "react-dom";
import { useCardDetails } from "../hooks/useCardDetails";
import { Star, Link2 } from "lucide-react";
import { useOptionalTooltipContext } from "../hooks/useTooltipContext";

const ATTRIBUTE_COLORS: Record<string, string> = {
  FIRE: "text-orange-400 border-orange-500/40 bg-orange-500/10",
  WATER: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  WIND: "text-green-400 border-green-500/40 bg-green-500/10",
  EARTH: "text-amber-600 border-amber-700/40 bg-amber-700/10",
  LIGHT: "text-yellow-300 border-yellow-400/40 bg-yellow-400/10",
  DARK: "text-purple-400 border-purple-500/40 bg-purple-500/10",
  DIVINE: "text-rose-300 border-rose-400/40 bg-rose-400/10",
};

const getAttributeClass = (attribute: string) =>
  ATTRIBUTE_COLORS[attribute.toUpperCase()] ??
  "text-slate-300 border-slate-600/40 bg-slate-600/10";

interface CardTooltipProps {
  cardId: number;
  imageUrl: string;
  cardName: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const CardTooltip = ({
  cardId,
  imageUrl,
  cardName,
  children,
  disabled = false,
}: CardTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const initialMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const tooltipContext = useOptionalTooltipContext();

  const reactId = useId();
  const tooltipId = useMemo(
    () => `tooltip-${cardId}-${reactId}`,
    [cardId, reactId],
  );

  // Fetch card details when tooltip is visible
  const { data: cardDetails, isLoading } = useCardDetails(
    isVisible ? cardId : null,
  );

  // Hide tooltip when disabled prop changes to true or another tooltip becomes active
  useEffect(() => {
    if (
      disabled ||
      (tooltipContext?.activeTooltipId &&
        tooltipContext.activeTooltipId !== tooltipId)
    ) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsVisible(false);
    }
  }, [disabled, tooltipContext?.activeTooltipId, tooltipId]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled) return;

    // Store initial mouse position and calculate position immediately
    initialMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Calculate position immediately before showing
    calculatePosition(e.clientX, e.clientY);

    // Delay showing tooltip slightly to avoid flickering on quick hover
    hoverTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Set this tooltip as the active one
      tooltipContext?.setActiveTooltip(tooltipId);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsVisible(false);
    // Clear active tooltip if this was the active one
    if (tooltipContext?.activeTooltipId === tooltipId) {
      tooltipContext?.setActiveTooltip(null);
    }
  };

  const calculatePosition = (mouseX: number, mouseY: number) => {
    // Use estimated dimensions for initial positioning
    const tooltipWidth = 700;
    const tooltipHeight = 420;
    const offset = 20;
    const edgeThreshold = 620;
    const margin = 10; // Additional margin from screen edges

    let x = mouseX + offset;
    let y = mouseY + offset;

    // Check if we're near the right edge of the screen
    if (mouseX > window.innerWidth - edgeThreshold) {
      // Always show on the left when near right edge
      x = mouseX - tooltipWidth - offset;
    } else if (x + tooltipWidth > window.innerWidth - margin) {
      // Otherwise, flip to left only if it would overflow
      x = mouseX - tooltipWidth - offset;
    }

    // Check if tooltip would overflow bottom of screen
    if (y + tooltipHeight > window.innerHeight - margin) {
      // Try to position above the cursor
      y = mouseY - tooltipHeight - offset;

      // If still doesn't fit, position at the top of the screen
      if (y < margin) {
        y = margin;
      }
    }

    // Ensure tooltip doesn't go off left edge
    if (x < margin) {
      x = margin;
    }

    // Ensure tooltip doesn't go off top edge
    if (y < margin) {
      y = margin;
    }

    setPosition({ x, y });
  };

  const schedulePositionUpdate = (mouseX: number, mouseY: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      // Use actual tooltip dimensions if available for fine-tuning
      const tooltip = tooltipRef.current;
      if (tooltip) {
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        const offset = 20;
        const edgeThreshold = 620;
        const margin = 10;

        let x = mouseX + offset;
        let y = mouseY + offset;

        if (mouseX > window.innerWidth - edgeThreshold) {
          x = mouseX - tooltipWidth - offset;
        } else if (x + tooltipWidth > window.innerWidth - margin) {
          x = mouseX - tooltipWidth - offset;
        }

        if (y + tooltipHeight > window.innerHeight - margin) {
          y = mouseY - tooltipHeight - offset;
          if (y < margin) {
            y = margin;
          }
        }

        if (x < margin) {
          x = margin;
        }

        if (y < margin) {
          y = margin;
        }

        setPosition({ x, y });
      }
      rafRef.current = null;
    });
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Reposition tooltip when content loads or changes
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      schedulePositionUpdate(
        initialMousePosRef.current.x,
        initialMousePosRef.current.y,
      );
    }
  }, [isVisible, cardDetails, isLoading]);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            role="tooltip"
            aria-label={`Card preview: ${cardName}`}
          >
            <div className="relative w-[680px] max-w-[calc(100vw-20px)] overflow-hidden rounded-[24px] border border-blue-500/40 bg-gradient-to-br from-[#090d18] via-[#13182b] to-[#190f30] shadow-[0_0_44px_rgba(37,99,235,0.16)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_36%)]" />
              <div className="pointer-events-none absolute inset-x-4 top-4 h-24 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30" />

              <div className="relative z-10 p-5">
                {isLoading ? (
                  <div className="flex min-h-[360px] items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[18px] border border-sky-400/20 bg-sky-500/10 shadow-[0_10px_24px_rgba(59,130,246,0.16)]">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sky-300"></div>
                    </div>
                  </div>
                ) : cardDetails ? (
                  <div className="flex items-start gap-5">
                    {/* Card image */}
                    <div className="w-[190px] flex-shrink-0">
                      <div className="rounded-[16px] border border-slate-700/80 bg-gradient-to-b from-slate-950/95 via-slate-900/92 to-[#130f25] p-1 shadow-[0_12px_28px_rgba(2,6,23,0.35)]">
                        <img
                          src={imageUrl}
                          alt={cardName}
                          className="h-auto w-full rounded-[12px] border border-blue-600/20 object-contain"
                          loading="eager"
                        />
                      </div>
                    </div>

                    {/* Card info panel */}
                    <div className="min-w-0 flex-1 flex flex-col gap-2.5">
                      {/* Name row + Attribute + Level */}
                      <div className="flex items-start justify-between gap-3 border-b border-sky-400/20 pb-2">
                        <h3 className="text-[22px] font-bold leading-tight text-white">
                          {cardDetails.name}
                        </h3>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {cardDetails.attribute && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide ${getAttributeClass(cardDetails.attribute)}`}
                            >
                              {cardDetails.attribute}
                            </span>
                          )}
                          {cardDetails.level !== undefined && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({
                                length: Math.min(cardDetails.level, 12),
                              }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                                  aria-hidden="true"
                                />
                              ))}
                            </div>
                          )}
                          {cardDetails.linkval !== undefined && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-300">
                              <Link2 className="w-3 h-3" aria-hidden="true" />
                              {cardDetails.linkval}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Type line: [ Race / Type ] */}
                      <p className="text-[13px] italic text-slate-300">
                        [ {cardDetails.race} /{" "}
                        {cardDetails.type
                          .replace(" Monster", "")
                          .replace("Monster", "")
                          .trim()}{" "}
                        ]
                      </p>

                      {/* Link markers */}
                      {cardDetails.linkmarkers &&
                        cardDetails.linkmarkers.length > 0 && (
                          <p className="text-xs text-sky-400">
                            Link: [{cardDetails.linkmarkers.join(", ")}]
                          </p>
                        )}

                      {/* Pendulum scale */}
                      {cardDetails.scale !== undefined && (
                        <p className="text-xs text-violet-300">
                          Pendulum Scale:{" "}
                          <span className="font-semibold text-white">
                            {cardDetails.scale}
                          </span>
                        </p>
                      )}

                      {/* Description */}
                      <div className="flex-1 rounded-[14px] border border-slate-700/50 bg-slate-950/30 p-3 text-[12.5px] leading-[1.65] text-slate-200/90 whitespace-pre-line">
                        {cardDetails.desc}
                      </div>

                      {/* ATK / DEF */}
                      {(cardDetails.atk !== undefined ||
                        cardDetails.def !== undefined) && (
                        <div className="flex items-center gap-5 border-t border-slate-700/50 pt-2 text-sm font-bold">
                          {cardDetails.atk !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">ATK/</span>
                              <span className="text-white">
                                {cardDetails.atk}
                              </span>
                            </div>
                          )}
                          {cardDetails.def !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">DEF/</span>
                              <span className="text-white">
                                {cardDetails.def}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[360px] items-center justify-center text-slate-400">
                    <p>No details available</p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
