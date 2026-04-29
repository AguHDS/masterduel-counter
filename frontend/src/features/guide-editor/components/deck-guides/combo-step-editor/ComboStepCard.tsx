import { useState } from "react";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { ComboStep } from "@/features/archetypes/types";
import ChainOverlayImg from "@/assets/chain_new_card.webp";
import ChainBadgeImg from "@/assets/chaincircle.webp";

interface ComboStepCardProps {
  step: ComboStep;
  stepNumber: number;
  isEditMode: boolean;
  compactMode?: boolean;
  fitToColumn?: boolean;
  hasCanceledFlow?: boolean;
  isViewingCanceledFlow?: boolean;
  onToggleCanceledFlow?: () => void;
  isContext?: boolean;
}

/**
 * Displays a single combo step card with main card, subcards, description, and chain indicators
 * Supports compact mode, canceled flow toggle, and expandable description/subcard lists
 * Used in both edit and view modes
 */
export const ComboStepCard = ({
  step,
  stepNumber,
  isEditMode: _isEditMode,
  compactMode = false,
  fitToColumn = false,
  hasCanceledFlow = false,
  isViewingCanceledFlow = false,
  onToggleCanceledFlow,
  isContext = false,
}: ComboStepCardProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showAllSubCards, setShowAllSubCards] = useState(false);
  const [showAllLeftSubCards, setShowAllLeftSubCards] = useState(false);

  const visibleSubCards = showAllSubCards
    ? step.subCards
    : step.subCards.slice(0, 3);
  const hasMoreSubCards = step.subCards.length > 3;

  const visibleLeftSubCards = showAllLeftSubCards
    ? step.leftSubCards
    : step.leftSubCards.slice(0, 3);
  const hasMoreLeftSubCards = step.leftSubCards.length > 3;

  const hasSideCards = step.leftSubCards.length > 0 || step.subCards.length > 0;
  const compactViewWidth = "clamp(150px, calc((100vw - 280px) / 2), 240px)";

  const renderDescriptionWithLineBreaks = (text: string) => {
    if (!text) return "No description";

    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div
      className={`relative border-b-2 border-blue-800/20 flex flex-col ${_isEditMode ? 'p-4 pt-8' : 'p-3 pt-8'} ${
        isContext ? 'opacity-70' : ''
      }`}
      style={{
        width: _isEditMode ? "370px" : fitToColumn ? "100%" : compactViewWidth,
        minWidth: _isEditMode ? "370px" : fitToColumn ? "0" : compactViewWidth,
        minHeight: _isEditMode
          ? isDescriptionExpanded
            ? "auto"
            : "520px"
          : isDescriptionExpanded
            ? "auto"
            : compactMode
              ? "300px"
              : "320px",
        height: isDescriptionExpanded ? "auto" : undefined,
        boxSizing: "border-box",
      }}
    >
      {/* Step Number Badge - Top Left */}
      <div className="absolute top-0 left-0 flex flex-col gap-1">
        <span className={`inline-block text-yellow-500 ${_isEditMode ? 'text-xs' : 'text-[11px]'} font-bold rounded-full`}>
          #{stepNumber}
        </span>
      </div>

      {/* Canceled Flow Button - Bottom Left (only for main flow steps with canceled flows) */}
      {hasCanceledFlow && onToggleCanceledFlow && (
        <button
          onClick={onToggleCanceledFlow}
          className={`absolute bottom-2 left-2 z-20 ${_isEditMode ? 'px-2 py-1' : 'px-1 py-0.5 max-[860px]:px-0.5'} ${_isEditMode ? 'text-[11px]' : 'text-[9px] max-[860px]:text-[8px]'} rounded-xl transition-colors ${
            isViewingCanceledFlow
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-red-600/80 text-white hover:bg-red-600'
          }`}
          title={isViewingCanceledFlow ? "Return to Main Flow" : "View Canceled Flow"}
        >
          {isViewingCanceledFlow ? "← Go Back" : "Negated?"}
        </button>
      )}

      {/* Layout: Left Sub Cards + Main Card + Right Sub Cards */}
      <div className={`flex items-start ${_isEditMode ? 'max-h-[200px]' : 'max-h-[160px] max-[860px]:max-h-[124px]'} ${_isEditMode ? 'gap-2' : 'gap-1.5 max-[860px]:gap-1'} justify-center flex-shrink-0`}>
        {/* Left Sub Cards OR Invisible Placeholder for balance */}
        {step.leftSubCards.length > 0 ? (
          <>
            <div className="flex flex-col items-center gap-1">
              <span className={`${_isEditMode ? 'text-[10px]' : 'text-[8px] max-[860px]:text-[7px]'} font-bold text-gray-500 uppercase tracking-wide`}>
                MATERIAL
              </span>
              <div className="flex gap-1">
                {/* Hidden cards column (shown on left when expanded) */}
                {showAllLeftSubCards && step.leftSubCards.length > 3 && (
                  <div className="flex flex-col gap-1">
                    {step.leftSubCards.slice(3, 5).map((card, index) => (
                      <div key={`${card.id}-${index + 3}`} className="relative inline-block">
                        <CardTooltip
                          cardId={card.id}
                          imageUrl={card.imageUrl}
                          cardName={card.name}
                        >
                          <img
                            src={card.imageUrlSmall}
                            alt={card.name}
                            className={`${_isEditMode ? 'w-10 h-14' : 'w-8 h-11 max-[860px]:w-6 max-[860px]:h-8'} relative ${_isEditMode ? 'top-[31px]' : 'top-[25px] max-[860px]:top-[19px]'} object-cover hover:scale-110 transition-transform cursor-pointer`}
                          />
                        </CardTooltip>
                        {card.chainNumber != null && (
                          <img src={ChainOverlayImg} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]" />
                        )}
                        {card.chainNumber != null && (
                          <span
                            className="absolute bottom-0 top-[54px] max-[860px]:top-[39px] left-0 z-[2] w-[15px] h-[15px] max-[860px]:w-[11px] max-[860px]:h-[11px] bg-center bg-cover bg-no-repeat text-cyan-100 text-[8px] max-[860px]:text-[7px] font-bold flex items-center justify-center"
                            style={{ backgroundImage: `url(${ChainBadgeImg})` }}
                          >
                            {card.chainNumber}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* First 3 cards column (always visible) */}
                <div
                  className="flex flex-col gap-1 z-50 items-center"
                  style={{ minHeight: _isEditMode ? "232px" : "154px" }}
                >
                  {visibleLeftSubCards.slice(0, 3).map((card, index) => (
                    <div key={`${card.id}-${index}`} className="relative inline-block">
                      <CardTooltip
                        cardId={card.id}
                        imageUrl={card.imageUrl}
                        cardName={card.name}
                      >
                        <img
                          src={card.imageUrlSmall}
                          alt={card.name}
                          className={`${_isEditMode ? 'w-10 h-14' : 'w-8 h-11 max-[860px]:w-6 max-[860px]:h-8'} object-cover hover:scale-110 transition-transform cursor-pointer`}
                        />
                      </CardTooltip>
                      {card.chainNumber != null && (
                        <img src={ChainOverlayImg} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]" />
                      )}
                      {card.chainNumber != null && (
                        <span
                          className="absolute bottom-0 left-0 z-[2] w-[15px] h-[15px] max-[860px]:w-[11px] max-[860px]:h-[11px] bg-center bg-cover bg-no-repeat text-cyan-100 text-[8px] max-[860px]:text-[7px] font-bold flex items-center justify-center"
                          style={{ backgroundImage: `url(${ChainBadgeImg})` }}
                        >
                          {card.chainNumber}
                        </span>
                      )}
                    </div>
                  ))}
                  <div
                    style={{
                      height: _isEditMode ? "24px" : "20px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {hasMoreLeftSubCards && (
                      <button
                        onClick={() =>
                          setShowAllLeftSubCards(!showAllLeftSubCards)
                        }
                        className={`${_isEditMode ? 'text-[10px]' : 'text-[8px] max-[860px]:text-[7px]'} text-blue-400 hover:text-blue-300 py-0.5 px-1 bg-slate-700/50 rounded text-center w-full`}
                      >
                        {showAllLeftSubCards ? "Less" : "Show All"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Equals separator */}
            <span className={`text-blue-400 ${_isEditMode ? 'text-lg' : 'text-base max-[860px]:text-sm'} font-bold self-center ${_isEditMode ? 'bottom-3' : 'bottom-2 max-[860px]:bottom-1'} relative`}>
              =
            </span>
          </>
        ) : step.subCards.length > 0 ? (
          // Invisible placeholder to balance when only right subcards exist
          <div className="flex gap-1 opacity-0 pointer-events-none" aria-hidden="true">
            <div className="flex flex-col gap-1" style={{ minHeight: _isEditMode ? "232px" : "154px", width: _isEditMode ? "40px" : "24px" }}>
            </div>
            <span className={`text-blue-400 ${_isEditMode ? 'text-lg' : 'text-base max-[860px]:text-sm'} font-bold self-center ${_isEditMode ? 'bottom-3' : 'bottom-2 max-[860px]:bottom-1'} relative`}>
              =
            </span>
          </div>
        ) : null}

        {/* Main Card(s) - Always centered */}
        <div className="flex gap-2 relative top-4">
          {step.mainCards.map((card, index) => (
            <div key={`${card.id}-${index}`} className="relative inline-block">
              <CardTooltip
                cardId={card.id}
                imageUrl={card.imageUrl}
                cardName={card.name}
              >
                <img
                  src={card.imageUrlSmall}
                  alt={card.name}
                  className={`${_isEditMode ? 'w-32 h-44' : 'w-20 h-28 max-[860px]:w-14 max-[860px]:h-20'} object-cover hover:scale-105 transition-transform cursor-pointer`}
                />
              </CardTooltip>
              {card.chainNumber != null && (
                <img src={ChainOverlayImg} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]" />
              )}
              {card.chainNumber != null && (
                <span
                  className={`absolute bottom-0 left-0 z-[2] w-[24px] h-[24.5px] max-[860px]:w-[16px] max-[860px]:h-[16px] bg-center bg-cover bg-no-repeat text-cyan-100 ${_isEditMode ? 'text-[10px]' : 'text-[18px] max-[860px]:text-[10px]'} font-bold flex items-center justify-center`}
                  style={{ backgroundImage: `url(${ChainBadgeImg})` }}
                >
                  {card.chainNumber}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Right Sub Cards OR Invisible Placeholder for balance */}
        {step.subCards.length > 0 ? (
          <>
            {/* Plus separator */}
            <span className={`text-blue-400 ${_isEditMode ? 'text-lg' : 'text-base max-[860px]:text-sm'} font-bold self-center ${_isEditMode ? 'bottom-3' : 'bottom-2 max-[860px]:bottom-1'} relative`}>
              +
            </span>

            <div className="flex flex-col items-center gap-1">
              <span className={`${_isEditMode ? 'text-[10px]' : 'text-[8px] max-[860px]:text-[7px]'} font-bold text-gray-500 uppercase tracking-wide`}>
                EFFECT
              </span>
              <div className="flex gap-1 z-50">
                {/* First 3 cards column (always visible) */}
                <div
                  className="flex flex-col gap-1 items-center"
                  style={{ minHeight: _isEditMode ? "232px" : "154px" }}
                >
                  {visibleSubCards.slice(0, 3).map((card, index) => (
                    <div key={`${card.id}-${index}`} className="relative inline-block">
                      <CardTooltip
                        cardId={card.id}
                        imageUrl={card.imageUrl}
                        cardName={card.name}
                      >
                        <img
                          src={card.imageUrlSmall}
                          alt={card.name}
                          className={`${_isEditMode ? 'w-10 h-14' : 'w-8 h-11 max-[860px]:w-6 max-[860px]:h-8'} object-cover hover:scale-110 transition-transform cursor-pointer`}
                        />
                      </CardTooltip>
                      {card.chainNumber != null && (
                        <img src={ChainOverlayImg} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]" />
                      )}
                      {card.chainNumber != null && (
                        <span
                          className="absolute bottom-0 left-0 z-[2] w-[15px] h-[15px] max-[860px]:w-[11px] max-[860px]:h-[11px] bg-center bg-cover bg-no-repeat text-cyan-100 text-[8px] max-[860px]:text-[7px] font-bold flex items-center justify-center"
                          style={{ backgroundImage: `url(${ChainBadgeImg})` }}
                        >
                          {card.chainNumber}
                        </span>
                      )}
                    </div>
                  ))}
                  <div
                    style={{
                      height: _isEditMode ? "24px" : "20px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {hasMoreSubCards && (
                      <button
                        onClick={() => setShowAllSubCards(!showAllSubCards)}
                        className={`${_isEditMode ? 'text-[10px]' : 'text-[8px] max-[860px]:text-[7px]'} text-blue-400 hover:text-blue-300 py-0.5 px-1 bg-slate-700/50 rounded text-center w-full`}
                      >
                        {showAllSubCards ? "Less" : "Show All"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Hidden cards column (shown on right when expanded) */}
                {showAllSubCards && step.subCards.length > 3 && (
                  <div className="flex flex-col gap-1">
                    {step.subCards.slice(3, 5).map((card, index) => (
                      <div key={`${card.id}-${index + 3}`} className="relative inline-block">
                        <CardTooltip
                          cardId={card.id}
                          imageUrl={card.imageUrl}
                          cardName={card.name}
                        >
                          <img
                            src={card.imageUrlSmall}
                            alt={card.name}
                            className={`${_isEditMode ? 'w-10 h-14' : 'w-8 h-11 max-[860px]:w-6 max-[860px]:h-8'} relative ${_isEditMode ? 'top-[31px]' : 'top-[25px] max-[860px]:top-[19px]'} object-cover hover:scale-110 transition-transform cursor-pointer`}
                          />
                        </CardTooltip>
                        {card.chainNumber != null && (
                          <img src={ChainOverlayImg} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]" />
                        )}
                        {card.chainNumber != null && (
                          <span
                            className="absolute bottom-0 top-[54px] max-[860px]:top-[39px] left-0 z-[2] w-[15px] h-[15px] max-[860px]:w-[11px] max-[860px]:h-[11px] bg-center bg-cover bg-no-repeat text-cyan-100 text-[8px] max-[860px]:text-[7px] font-bold flex items-center justify-center"
                            style={{ backgroundImage: `url(${ChainBadgeImg})` }}
                          >
                            {card.chainNumber}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : step.leftSubCards.length > 0 ? (
          // Invisible placeholder to balance when only left subcards exist
          <div className="flex gap-1 opacity-0 pointer-events-none" aria-hidden="true">
            <span className={`text-blue-400 ${_isEditMode ? 'text-lg' : 'text-base max-[860px]:text-sm'} font-bold self-center ${_isEditMode ? 'bottom-3' : 'bottom-2 max-[860px]:bottom-1'} relative`}>
              +
            </span>
            <div className="flex flex-col gap-1" style={{ minHeight: _isEditMode ? "232px" : "154px", width: _isEditMode ? "40px" : "24px" }}>
            </div>
          </div>
        ) : null}
      </div>

      {/* Description - Always centered regardless of card layout */}
      <div className={`w-full flex flex-col items-center flex-1 ${!hasSideCards ? 'relative top-12' : ''}`}>
        <span className={`${_isEditMode ? 'text-xs' : 'text-[10px]'} font-semibold text-blue-400 uppercase tracking-wide`}>
          Description
        </span>
        <div
          className={`text-center py-1 px-2 text-slate-300 ${_isEditMode ? 'text-[13px]' : 'text-[11px]'} mx-auto`}
          style={{
            overflowWrap: "break-word",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            lineHeight: "1.3em",
            maxHeight: !isDescriptionExpanded ? "4rem" : "none",
            overflow: "hidden",
            transition: "max-height 0.3s ease-in-out",
            width: "100%",
            maxWidth: _isEditMode ? "340px" : "calc(100% - 8px)",
          }}
        >
          {renderDescriptionWithLineBreaks(step.description || "")}
        </div>
        {(step.description || "").length > 100 && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className={`${_isEditMode ? 'text-xs' : 'text-[10px]'} text-blue-400 hover:text-blue-300 px-2 py-1 mt-1 flex-shrink-0`}
          >
            {isDescriptionExpanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  );
};