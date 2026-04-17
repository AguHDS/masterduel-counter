import { useState, useRef, useEffect, useMemo, useId } from "react";
import { createPortal } from "react-dom";
import { useCardDetails } from "../hooks/useCardDetails";
import { Star, Swords, Shield, LoaderPinwheel } from "lucide-react";
import { useOptionalTooltipContext } from "../hooks/useTooltipContext";

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
    const tooltipWidth = 820;
    const tooltipHeight = 500;
    const offset = 20;
    const edgeThreshold = 700;
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
        const edgeThreshold = 700;
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
            <div className="relative w-[760px] max-w-[calc(100vw-20px)] overflow-hidden rounded-[24px] border border-blue-500/40 bg-gradient-to-br from-[#090d18] via-[#13182b] to-[#190f30] shadow-[0_0_44px_rgba(37,99,235,0.16)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_36%)]" />
              <div className="pointer-events-none absolute inset-x-4 top-4 h-24 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30" />

              <div className="relative z-10 p-5">
                {isLoading ? (
                  <div className="flex min-h-[420px] items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[18px] border border-sky-400/20 bg-sky-500/10 shadow-[0_10px_24px_rgba(59,130,246,0.16)]">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sky-300"></div>
                    </div>
                  </div>
                ) : cardDetails ? (
                  <div className="space-y-5">
                    <div className="flex items-start gap-5">
                      <div className="w-[230px] flex-shrink-0 border-r border-slate-700/70 pr-4">
                        <div className="rounded-[20px] border border-slate-700/80 bg-gradient-to-b from-slate-950/95 via-slate-900/92 to-[#130f25] p-1 shadow-[0_12px_28px_rgba(2,6,23,0.35)]">
                          <img
                            src={imageUrl}
                            alt={cardName}
                            className="h-auto w-full rounded-[16px] border border-blue-600/20 object-contain"
                            loading="eager"
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="space-y-3 border-b border-sky-400/20 pb-3">
                          <h3 className="text-[30px] font-bold leading-tight text-white">
                            {cardDetails.name}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 font-medium text-sky-200">
                            {cardDetails.race}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-300">
                            {cardDetails.type}
                          </span>
                        </div>

                        {cardDetails.attribute && (
                          <div className="flex w-fit items-center gap-2 rounded-[14px] border border-slate-700/70 bg-slate-950/35 px-3 py-2 text-sm">
                            <LoaderPinwheel
                              className="w-4 h-4 text-slate-400"
                              aria-hidden="true"
                            />
                            <span className="font-medium text-white">
                              {cardDetails.attribute}
                            </span>
                          </div>
                        )}

                        {cardDetails.level !== undefined && (
                          <div className="flex w-fit items-center gap-2 rounded-[14px] border border-slate-700/70 bg-slate-950/35 px-3 py-2 text-sm">
                            <Star
                              className="w-4 h-4 text-yellow-400"
                              aria-hidden="true"
                            />
                            <span className="text-slate-300">
                              Level/Rank:{" "}
                              <span className="font-semibold text-white">
                                {cardDetails.level}
                              </span>
                            </span>
                          </div>
                        )}

                        {cardDetails.linkval !== undefined && (
                          <div className="flex w-fit flex-wrap items-center gap-2 rounded-[14px] border border-slate-700/70 bg-slate-950/35 px-3 py-2 text-sm">
                            <span className="text-slate-300">
                              Link:{" "}
                              <span className="font-semibold text-white">
                                {cardDetails.linkval}
                              </span>
                            </span>
                            {cardDetails.linkmarkers && (
                              <span className="text-xs text-sky-300">
                                [{cardDetails.linkmarkers.join(", ")}]
                              </span>
                            )}
                          </div>
                        )}

                        {cardDetails.scale !== undefined && (
                          <div className="flex w-fit items-center gap-2 rounded-[14px] border border-slate-700/70 bg-slate-950/35 px-3 py-2 text-sm">
                            <span className="text-slate-300">
                              Scale:{" "}
                              <span className="font-semibold text-white">
                                {cardDetails.scale}
                              </span>
                            </span>
                          </div>
                        )}

                        {(cardDetails.atk !== undefined ||
                          cardDetails.def !== undefined) && (
                          <div className="flex w-fit flex-wrap items-center gap-4 rounded-[16px] border border-slate-700/70 bg-slate-950/35 px-3 py-2.5 text-sm">
                            {cardDetails.atk !== undefined && (
                              <div className="flex items-center gap-1">
                                <Swords
                                  className="w-4 h-4 text-red-400"
                                  aria-hidden="true"
                                />
                                <span className="text-slate-300">
                                  ATK:{" "}
                                  <span className="font-semibold text-white">
                                    {cardDetails.atk}
                                  </span>
                                </span>
                              </div>
                            )}
                            {cardDetails.def !== undefined && (
                              <div className="flex items-center gap-1">
                                <Shield
                                  className="w-4 h-4 text-blue-400"
                                  aria-hidden="true"
                                />
                                <span className="text-slate-300">
                                  DEF:{" "}
                                  <span className="font-semibold text-white">
                                    {cardDetails.def}
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-sky-400/12 bg-slate-950/35 p-4 shadow-[inset_0_1px_0_rgba(148,163,184,0.05)]">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                          Description
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-sky-400/30 to-transparent" />
                      </div>
                      <p className="whitespace-pre-line text-sm leading-6 text-slate-200/90">
                        {cardDetails.desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[420px] items-center justify-center text-slate-400">
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
