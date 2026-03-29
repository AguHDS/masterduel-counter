import { useState } from "react";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { ComboStep } from "@/features/archetypes/types";

interface ComboStepCardProps {
  step: ComboStep;
  stepNumber: number;
  isEditMode: boolean;
}

export const ComboStepCard = ({
  step,
  stepNumber,
  isEditMode: _isEditMode,
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
      className="relative flex flex-col  p-4 pt-10"
      style={{
        width: "100%",
        maxWidth: "370px",
        minHeight: "320px",
        maxHeight: "520px",
      }}
    >
      {/* Step Number Badge - Top Left */}
      <div className="absolute top-2 left-2">
        <span className="inline-block px-2 py-0.5 text-yellow-500 text-xs font-bold rounded-full">
          #{stepNumber}
        </span>
      </div>

      {/* Layout: Left Sub Cards + Main Card + Right Sub Cards */}
      <div className="flex items-start max-h-[200px] gap-2 justify-center flex-shrink-0">
        {/* Left Sub Cards - Show hidden cards to the LEFT when expanded */}
        {step.leftSubCards.length > 0 && (
          <>
            <div className="flex gap-1">
              {/* Hidden cards column (shown on left when expanded) */}
              {showAllLeftSubCards && step.leftSubCards.length > 3 && (
                <div className="flex flex-col gap-1">
                  {step.leftSubCards.slice(3, 5).map((card, index) => (
                    <CardTooltip
                      key={`${card.id}-${index + 3}`}
                      cardId={card.id}
                      imageUrl={card.imageUrl || card.imageUrlSmall}
                      cardName={card.name}
                    >
                      <img
                        src={card.imageUrlSmall || card.imageUrl}
                        alt={card.name}
                        className="w-10 h-14 relative top-[31px] object-cover hover:scale-110 transition-transform cursor-pointer"
                      />
                    </CardTooltip>
                  ))}
                </div>
              )}

              {/* First 3 cards column (always visible) */}
              <div
                className="flex flex-col gap-1"
                style={{ minHeight: "232px" }}
              >
                {visibleLeftSubCards.slice(0, 3).map((card, index) => (
                  <CardTooltip
                    key={`${card.id}-${index}`}
                    cardId={card.id}
                    imageUrl={card.imageUrl || card.imageUrlSmall}
                    cardName={card.name}
                  >
                    <img
                      src={card.imageUrlSmall || card.imageUrl}
                      alt={card.name}
                      className="w-10 h-14 object-cover hover:scale-110 transition-transform cursor-pointer"
                    />
                  </CardTooltip>
                ))}
                <div
                  style={{
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {hasMoreLeftSubCards && (
                    <button
                      onClick={() =>
                        setShowAllLeftSubCards(!showAllLeftSubCards)
                      }
                      className="text-[10px] text-blue-400 hover:text-blue-300 py-0.5 px-1 bg-slate-700/50 rounded text-center w-full"
                    >
                      {showAllLeftSubCards ? "Less" : "Show All"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Equals separator */}
            <span className="text-blue-400 text-lg font-bold self-center bottom-3 relative">
              =
            </span>
          </>
        )}

        {/* Main Card(s) */}
        <div className="flex gap-2">
          {step.mainCards.map((card, index) => (
            <CardTooltip
              key={`${card.id}-${index}`}
              cardId={card.id}
              imageUrl={card.imageUrl || card.imageUrlSmall}
              cardName={card.name}
            >
              <img
                src={card.imageUrl || card.imageUrlSmall}
                alt={card.name}
                className="w-32 h-44 object-cover hover:scale-105 transition-transform cursor-pointer"
              />
            </CardTooltip>
          ))}
        </div>

        {/* Right Sub Cards - Show hidden cards to the RIGHT when expanded */}
        {step.subCards.length > 0 && (
          <>
            {/* Plus separator */}
            <span className="text-blue-400 text-lg font-bold self-center bottom-3 relative">
              +
            </span>

            <div className="flex gap-1">
              {/* First 3 cards column (always visible) */}
              <div
                className="flex flex-col gap-1"
                style={{ minHeight: "232px" }}
              >
                {visibleSubCards.slice(0, 3).map((card, index) => (
                  <CardTooltip
                    key={`${card.id}-${index}`}
                    cardId={card.id}
                    imageUrl={card.imageUrl || card.imageUrlSmall}
                    cardName={card.name}
                  >
                    <img
                      src={card.imageUrlSmall || card.imageUrl}
                      alt={card.name}
                      className="w-10 h-14 object-cover hover:scale-110 transition-transform cursor-pointer"
                    />
                  </CardTooltip>
                ))}
                <div
                  style={{
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {hasMoreSubCards && (
                    <button
                      onClick={() => setShowAllSubCards(!showAllSubCards)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 py-0.5 px-1 bg-slate-700/50 rounded text-center w-full"
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
                    <CardTooltip
                      key={`${card.id}-${index + 3}`}
                      cardId={card.id}
                      imageUrl={card.imageUrl || card.imageUrlSmall}
                      cardName={card.name}
                    >
                      <img
                        src={card.imageUrlSmall || card.imageUrl}
                        alt={card.name}
                        className="w-10 h-14 relative top-[31px] object-cover hover:scale-110 transition-transform cursor-pointer"
                      />
                    </CardTooltip>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Description */}
      <div className="w-full flex flex-col items-center mt-2 flex-1 min-h-0">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">
          Description
        </span>
        <div
          className="text-center py-1 px-2 text-slate-300 text-[13px] w-full overflow-hidden scrollbar-homeAllPages"
          style={{
            overflowWrap: "break-word",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            lineHeight: "1.3em",
            maxHeight: !isDescriptionExpanded ? "4rem" : "200px",
            transition: "max-height 0.3s ease-in-out",
          }}
        >
          {renderDescriptionWithLineBreaks(step.description || "")}
        </div>
        {(step.description || "").length > 100 && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 mt-1"
          >
            {isDescriptionExpanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  );
};
