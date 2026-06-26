import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { ComboStep } from "@/features/archetypes/types";

interface PendulumStepCardProps {
  step: ComboStep;
}

/** Read-only display of a pendulum combo step with left/right scale cards and a 6-card pendulum summon grid */
export const PendulumStepCard = ({ step }: PendulumStepCardProps) => {
  return (
    <div className="flex justify-between items-center px-4 max-[1460px]:px-3 max-[1200px]:px-2 max-[500px]:px-1 min-h-[120px] w-full">
      <div className="flex flex-col items-center gap-0.5 relative top-16 min-w-[32px] max-[500px]:min-w-[20px] ring-1 ring-purple-500/10 rounded-md bg-purple-950/10">
        <span className="text-[8px] max-[860px]:text-[7px] max-[500px]:text-[6px] font-bold text-red-400/70 uppercase tracking-wide">SCALE</span>
        {step.subCards[0] && (
          <div className="relative">
            <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-red-400 text-sm max-[700px]:text-xs max-[500px]:text-[11px] font-bold z-10">{step.rightScaleValue ?? 0}</span>
            <CardTooltip cardId={step.subCards[0].id} imageUrl={step.subCards[0].imageUrl} cardName={step.subCards[0].name}>
              <img src={step.subCards[0].imageUrlSmall} alt={step.subCards[0].name} className="w-10 h-14 max-[1200px]:w-8 max-[1200px]:h-11 max-[860px]:w-6 max-[860px]:h-9 max-[500px]:w-5 max-[500px]:h-7 object-cover rounded border border-gray-500/50 shadow" />
            </CardTooltip>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center bg-slate-900/40 rounded-lg shadow-[0_0_8px_rgba(139,92,246,0.08)]">
        <h3 className="text-[11px] font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wide mb-1 text-nowrap">
          Pendulum Summon
        </h3>
        <div className="grid grid-cols-3 place-items-center gap-0 min-[390px]:gap-0.5 min-[1030px]:gap-1 min-[1530px]:gap-1.5 translate-y-2.5">
          {Array.from({ length: 6 }, (_, i) => {
            const card = step.mainCards[i];
            return card ? (
              <div key={`${card.id}-${i}`}>
                <CardTooltip cardId={card.id} imageUrl={card.imageUrl} cardName={card.name}>
                  <img src={card.imageUrlSmall} alt={card.name} className="w-7 h-10 min-[390px]:w-9 min-[390px]:h-12 min-[860px]:w-12 min-[860px]:h-16 min-[1030px]:w-10 min-[1030px]:h-14 min-[1530px]:w-14 min-[1530px]:h-[5rem] min-[1750px]:w-14 min-[1750px]:h-[5rem] object-cover rounded border border-gray-500/50 shadow" />
                </CardTooltip>
              </div>
            ) : (
              <div key={`empty-${i}`} className="w-7 h-10 min-[390px]:w-9 min-[390px]:h-12 min-[860px]:w-12 min-[860px]:h-16 min-[1030px]:w-10 min-[1030px]:h-14 min-[1530px]:w-14 min-[1530px]:h-[5rem] min-[1750px]:w-14 min-[1750px]:h-[5rem] invisible" />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-0.5 relative top-16 min-w-[32px] max-[500px]:min-w-[20px] ring-1 ring-purple-500/10 rounded-md bg-purple-950/10">
        <span className="text-[8px] max-[860px]:text-[7px] max-[500px]:text-[6px] font-bold text-blue-400/70 uppercase tracking-wide">SCALE</span>
        {step.leftSubCards[0] && (
          <div className="relative">
            <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-blue-400 text-sm max-[700px]:text-xs max-[500px]:text-[11px] font-bold z-10">{step.leftScaleValue ?? 0}</span>
            <CardTooltip cardId={step.leftSubCards[0].id} imageUrl={step.leftSubCards[0].imageUrl} cardName={step.leftSubCards[0].name}>
              <img src={step.leftSubCards[0].imageUrlSmall} alt={step.leftSubCards[0].name} className="w-10 h-14 max-[1200px]:w-8 max-[1200px]:h-11 max-[860px]:w-6 max-[860px]:h-9 max-[500px]:w-5 max-[500px]:h-7 object-cover rounded border border-gray-500/50 shadow" />
            </CardTooltip>
          </div>
        )}
      </div>
    </div>
  );
};
