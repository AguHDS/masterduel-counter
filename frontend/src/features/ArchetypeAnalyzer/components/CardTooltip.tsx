import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCardDetails } from "../hooks/useCardDetails";
import { Star, Swords, Shield, Zap } from "lucide-react";

interface CardTooltipProps {
  cardId: number;
  imageUrl: string;
  cardName: string;
  children: React.ReactNode;
}

export const CardTooltip = ({ cardId, imageUrl, cardName, children }: CardTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Fetch card details when tooltip is visible
  const { data: cardDetails, isLoading } = useCardDetails(isVisible ? cardId : null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    // Delay showing tooltip slightly to avoid flickering on quick hover
    hoverTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setMousePosition({ x: e.clientX, y: e.clientY });
      schedulePositionUpdate(e.clientX, e.clientY);
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
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isVisible) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      schedulePositionUpdate(e.clientX, e.clientY);
    }
  };

  const schedulePositionUpdate = (mouseX: number, mouseY: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      // Use actual tooltip dimensions if available, otherwise use estimates
      const tooltip = tooltipRef.current;
      const tooltipWidth = tooltip?.offsetWidth || 640;
      const tooltipHeight = tooltip?.offsetHeight || 500;
      const offset = 20;
      const edgeThreshold = 500;
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
      schedulePositionUpdate(mousePosition.x, mousePosition.y);
    }
  }, [isVisible, cardDetails, isLoading]);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="relative inline-block"
      >
        {children}
      </div>

      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className="fixed pointer-events-none z-[9999] animate-in fade-in duration-150"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          role="tooltip"
          aria-label={`Card preview: ${cardName}`}
        >
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 rounded-xl shadow-2xl border-2 border-blue-500/50 overflow-hidden flex max-w-[640px]">
            {/* Left side: Card Image */}
            <div className="flex-shrink-0 bg-slate-900/50 p-3">
              <img
                src={imageUrl}
                alt={cardName}
                className="w-[280px] h-auto object-contain rounded-lg border border-blue-600/30"
                loading="eager"
              />
            </div>

            {/* Right side: Card Info */}
            <div className="flex-1 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : cardDetails ? (
                <div className="space-y-3">
                  {/* Card Name */}
                  <h3 className="text-lg font-bold text-white border-b border-blue-600/40 pb-2">
                    {cardDetails.name}
                  </h3>

                  {/* Card Type & Race */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded font-medium">
                      {cardDetails.race}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">{cardDetails.type}</span>
                  </div>

                  {/* Attribute (for monsters) */}
                  {cardDetails.attribute && (
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                      <span className="text-yellow-300 font-medium">{cardDetails.attribute}</span>
                    </div>
                  )}

                  {/* Level/Rank/Link */}
                  {cardDetails.level !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                      <span className="text-gray-300">
                        Level/Rank: <span className="text-white font-semibold">{cardDetails.level}</span>
                      </span>
                    </div>
                  )}

                  {cardDetails.linkval !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-300">
                        Link: <span className="text-white font-semibold">{cardDetails.linkval}</span>
                      </span>
                      {cardDetails.linkmarkers && (
                        <span className="text-xs text-blue-300">
                          [{cardDetails.linkmarkers.join(", ")}]
                        </span>
                      )}
                    </div>
                  )}

                  {/* Scale (for Pendulum) */}
                  {cardDetails.scale !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-300">
                        Scale: <span className="text-white font-semibold">{cardDetails.scale}</span>
                      </span>
                    </div>
                  )}

                  {/* ATK/DEF */}
                  {(cardDetails.atk !== undefined || cardDetails.def !== undefined) && (
                    <div className="flex items-center gap-4 text-sm">
                      {cardDetails.atk !== undefined && (
                        <div className="flex items-center gap-1">
                          <Swords className="w-4 h-4 text-red-400" aria-hidden="true" />
                          <span className="text-gray-300">
                            ATK: <span className="text-white font-semibold">{cardDetails.atk}</span>
                          </span>
                        </div>
                      )}
                      {cardDetails.def !== undefined && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-blue-400" aria-hidden="true" />
                          <span className="text-gray-300">
                            DEF: <span className="text-white font-semibold">{cardDetails.def}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Archetype */}
                  {cardDetails.archetype && (
                    <div className="text-sm">
                      <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs font-medium">
                        {cardDetails.archetype}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <div className="pt-2 border-t border-blue-600/30">
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                      {cardDetails.desc}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No details available</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};