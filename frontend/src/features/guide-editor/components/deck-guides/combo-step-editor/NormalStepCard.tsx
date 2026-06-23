import { useState } from "react";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { ComboStep } from "@/features/archetypes/types";
import ChainOverlayImg from "@/assets/chain_new_card.webp";
import ChainBadgeImg from "@/assets/chaincircle.webp";

interface NormalStepCardProps {
  step: ComboStep;
  isEditMode: boolean;
}

/** Read-only display of a normal combo step with MATERIAL side cards, main card(s), EFFECT side cards and expandable slots */
export const NormalStepCard = ({ step, isEditMode }: NormalStepCardProps) => {
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

  return (
    <>
      {step.leftSubCards.length > 0 ? (
        <>
          <div className={`flex flex-col items-center gap-1 ${step.leftSubCards.length > 0 && step.subCards.length === 0 ? '-translate-x-[8px]' : ''}`}>
            <span className={`${isEditMode ? 'text-[10px]' : 'text-[8px] max-[860px]:text-[7px] max-[556px]:text-[6px]'} font-bold text-gray-500 uppercase tracking-wide`}>
              MATERIAL
            </span>
            <div className="flex gap-1">
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
                          className={`${isEditMode ? 'w-10 h-14' : 'w-8 h-11 max-[860px]:w-6 max-[860px]:h-8 max-[700px]:w-[18px] max-[700px]:h-[25px]'} relative ${isEditMode ? 'top-[31px]' : 'top-[25px] max-[860px]:top-[19px]'} object-cover hover:scale-110 transition-transform cursor-pointer`}
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

              <div
                className="flex flex-col gap-1.5 z-50 items-center"
                style={{ minHeight: isEditMode ? "232px" : "154px" }}
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
                        className={`${isEditMode ? 'w-10 h-14' : 'w-8 h-11 max-[860px]:w-6 max-[860px]:h-8 max-[700px]:w-[18px] max-[700px]:h-[25px]'} object-cover hover:scale-110 transition-transform cursor-pointer`}
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
                    height: isEditMode ? "24px" : "20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {hasMoreLeftSubCards && (
                    <button
                      onClick={() =>
                        setShowAllLeftSubCards(!showAllLeftSubCards)
                      }
                      className={`${isEditMode ? 'text-[10px]' : 'text-[8px] max-[860px]:text-[7px]'} text-blue-400 hover:text-blue-300 py-0.5 px-1 bg-slate-700/50 rounded text-center w-full`}
                    >
                      {showAllLeftSubCards ? "Less" : "Show All"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <span className={`text-blue-400 ${isEditMode ? 'text-lg' : 'text-base max-[860px]:text-sm max-[556px]:text-[8px]'} font-bold self-center ${isEditMode ? 'bottom-3' : 'bottom-2 max-[860px]:bottom-1'} relative ${step.leftSubCards.length > 0 && step.subCards.length === 0 ? '-translate-x-[8px]' : ''}`}>
            =
          </span>
        </>
      ) : step.subCards.length > 0 ? (
        <div className="flex gap-1 opacity-0 pointer-events-none" aria-hidden="true">
          <div className="flex flex-col gap-1" style={{ minHeight: isEditMode ? "232px" : "154px", width: isEditMode ? "40px" : "24px" }}>
          </div>
          <span className={`text-blue-400 ${isEditMode ? 'text-lg' : 'text-base max-[860px]:text-sm max-[556px]:text-[8px]'} font-bold self-center ${isEditMode ? 'bottom-3' : 'bottom-2 max-[860px]:bottom-1'} relative`}>
            =
          </span>
        </div>
      ) : null}

      <div className={`flex gap-2 relative top-4 shrink-0 ${step.subCards.length > 0 && step.leftSubCards.length === 0 ? 'translate-x-[8px]' : ''} ${step.leftSubCards.length > 0 && step.subCards.length === 0 ? '-translate-x-[8px]' : ''}`}>
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
                className={`${isEditMode ? 'w-32 h-44' : 'w-[84px] h-[125px] max-[860px]:w-14 max-[860px]:h-20 max-[700px]:w-12 max-[700px]:h-[72px]'} object-cover hover:scale-105 transition-transform cursor-pointer`}
              />
            </CardTooltip>
            {card.chainNumber != null && (
              <img src={ChainOverlayImg} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]" />
            )}
            {card.chainNumber != null && (
              <span
                className={`absolute bottom-0 left-0 z-[2] w-[24px] h-[24.5px] max-[860px]:w-[16px] max-[860px]:h-[16px] bg-center bg-cover bg-no-repeat text-cyan-100 ${isEditMode ? 'text-[10px]' : 'text-[18px] max-[860px]:text-[10px]'} font-bold flex items-center justify-center`}
                style={{ backgroundImage: `url(${ChainBadgeImg})` }}
              >
                {card.chainNumber}
              </span>
            )}
          </div>
        ))}
      </div>

      {step.subCards.length > 0 ? (
        <>
          <span className={`text-blue-400 ${isEditMode ? 'text-lg' : 'text-base max-[860px]:text-sm max-[556px]:text-[8px]'} font-bold self-center ${isEditMode ? 'bottom-3' : 'bottom-2 max-[860px]:bottom-1'} relative ${step.leftSubCards.length === 0 ? 'translate-x-[8px]' : ''}`}>
            +
          </span>

          <div className={`flex flex-col items-center gap-1 ${step.leftSubCards.length === 0 ? 'translate-x-[8px]' : ''}`}>
            <span className={`${isEditMode ? 'text-[10px]' : 'text-[8px] max-[860px]:text-[7px] max-[556px]:text-[6px]'} font-bold text-gray-500 uppercase tracking-wide`}>
              EFFECT
            </span>
            <div className="flex gap-1 z-50">
              <div
                className="flex flex-col gap-1.5 items-center"
                style={{ minHeight: isEditMode ? "232px" : "154px" }}
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
                        className={`${isEditMode ? 'w-10 h-14' : 'w-8 h-11 max-[860px]:w-6 max-[860px]:h-8 max-[700px]:w-[18px] max-[700px]:h-[25px]'} object-cover hover:scale-110 transition-transform cursor-pointer`}
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
                    height: isEditMode ? "24px" : "20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {hasMoreSubCards && (
                    <button
                      onClick={() => setShowAllSubCards(!showAllSubCards)}
                      className={`${isEditMode ? 'text-[10px]' : 'text-[8px] max-[860px]:text-[7px]'} text-blue-400 hover:text-blue-300 py-0.5 px-1 bg-slate-700/50 rounded text-center w-full`}
                    >
                      {showAllSubCards ? "Less" : "Show All"}
                    </button>
                  )}
                </div>
              </div>

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
                          className={`${isEditMode ? 'w-10 h-14' : 'w-8 h-11 max-[860px]:w-6 max-[860px]:h-8 max-[700px]:w-[18px] max-[700px]:h-[25px]'} relative ${isEditMode ? 'top-[31px]' : 'top-[25px] max-[860px]:top-[19px]'} object-cover hover:scale-110 transition-transform cursor-pointer`}
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
        <div className="flex gap-1 opacity-0 pointer-events-none" aria-hidden="true">
          <span className={`text-blue-400 ${isEditMode ? 'text-lg' : 'text-base max-[860px]:text-sm max-[556px]:text-[8px]'} font-bold self-center ${isEditMode ? 'bottom-3' : 'bottom-2 max-[860px]:bottom-1'} relative`}>
            +
          </span>
          <div className="flex flex-col gap-1" style={{ minHeight: isEditMode ? "232px" : "154px", width: isEditMode ? "40px" : "24px" }}>
          </div>
        </div>
      ) : null}
    </>
  );
};
