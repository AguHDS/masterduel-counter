import { useState, useEffect } from "react";
import { X, Plus, RotateCw } from "lucide-react";
import { FloatingCardSearchModal } from "../../../archetypes/components/FloatingCardSearchModal";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card } from "@/features/archetypes/types";

export type CardPosition = 'atk' | 'def';

export interface FieldBoard {
  id: string;
  fieldSpell: Card | null;
  extraMonsters: (Card | null)[];
  monsters: (Card | null)[];
  spellTraps: (Card | null)[];
  hand: (Card | null)[];
  graveyard: Card[];
  banished: Card[];
  extraDeck: Card[];
  description?: string;
  monsterPositions?: CardPosition[];
  extraMonsterPositions?: CardPosition[];
}

interface FinalBoardPreviewProps {
  isEditMode: boolean;
  fieldBoard: FieldBoard | null;
  onFieldBoardChange: (board: FieldBoard) => void;
  onDelete: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
  selectedHandTitle?: string;
}

type ZoneType =
  | "field"
  | "extraMonster"
  | "monster"
  | "spellTrap"
  | "graveyard"
  | "banished"
  | "hand"
  | "extraDeck";

/**
 * Editor component for managing the final board state
 * Allows placing cards in field zones (Field Spell, Extra Deck Monsters, Main Monsters, Spell/Trap, Hand, GY, Banish)
 * Supports monster position toggles (ATK/DEF) and optional description
 */
export const FinalBoardPreview = ({
  isEditMode,
  fieldBoard,
  onFieldBoardChange,
  onDelete,
  onModalStateChange,
  forceCloseModal = false,
  selectedHandTitle,
}: FinalBoardPreviewProps) => {
  const [selectingZone, setSelectingZone] = useState<{
    type: ZoneType;
    index: number;
  } | null>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [hoveringZone, setHoveringZone] = useState<
    "graveyard" | "banished" | "extraDeck" | null
  >(null);
  const [isResponsive, setIsResponsive] = useState(false);

  // Detect screen width for responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsResponsive(window.innerWidth < 1024);
    };

    // Initial check
    checkScreenSize();
    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (forceCloseModal && selectingZone) {
      setSelectingZone(null);
    }
  }, [forceCloseModal, selectingZone]);

  useEffect(() => {
    if (!fieldBoard) return;

    let changed = false;
    const newMonsterPositions = [...(fieldBoard.monsterPositions ?? ['atk', 'atk', 'atk', 'atk', 'atk'])];
    fieldBoard.monsters.forEach((card, i) => {
      if (!card && newMonsterPositions[i] === 'def') {
        newMonsterPositions[i] = 'atk';
        changed = true;
      }
    });

    const newExtraMonsterPositions = [...(fieldBoard.extraMonsterPositions ?? ['atk', 'atk'])];
    fieldBoard.extraMonsters.forEach((card, i) => {
      if (!card && newExtraMonsterPositions[i] === 'def') {
        newExtraMonsterPositions[i] = 'atk';
        changed = true;
      }
    });

    if (changed) {
      onFieldBoardChange({
        ...fieldBoard,
        monsterPositions: newMonsterPositions,
        extraMonsterPositions: newExtraMonsterPositions,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldBoard]);

  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(!!selectingZone);
    }
  }, [selectingZone, onModalStateChange]);

  const handleCardSelected = (card: Card) => {
    if (!selectingZone || !fieldBoard) return;

    const updatedBoard = { ...fieldBoard };

    switch (selectingZone.type) {
      case "field":
        updatedBoard.fieldSpell = card;
        break;
      case "extraMonster":
        updatedBoard.extraMonsters[selectingZone.index] = card;
        break;
      case "monster":
        updatedBoard.monsters[selectingZone.index] = card;
        break;
      case "spellTrap":
        updatedBoard.spellTraps[selectingZone.index] = card;
        break;
      case "hand":
        updatedBoard.hand[selectingZone.index] = card;
        break;
      case "graveyard":
        updatedBoard.graveyard = [...updatedBoard.graveyard, card];
        break;
      case "banished":
        updatedBoard.banished = [...updatedBoard.banished, card];
        break;
      case "extraDeck":
        updatedBoard.extraDeck = [...updatedBoard.extraDeck, card];
        break;
    }

    onFieldBoardChange(updatedBoard);
    setSelectingZone(null);
  };

  const handleTogglePosition = (
    type: "monster" | "extraMonster",
    index: number,
  ) => {
    if (!fieldBoard) return;
    if (type === "monster") {
      const current: CardPosition[] =
        fieldBoard.monsterPositions ?? ['atk', 'atk', 'atk', 'atk', 'atk'];
      const next = [...current];
      next[index] = current[index] === 'def' ? 'atk' : 'def';
      onFieldBoardChange({ ...fieldBoard, monsterPositions: next });
    } else {
      const current: CardPosition[] =
        fieldBoard.extraMonsterPositions ?? ['atk', 'atk'];
      const next = [...current];
      next[index] = current[index] === 'def' ? 'atk' : 'def';
      onFieldBoardChange({ ...fieldBoard, extraMonsterPositions: next });
    }
  };

  const handleRemoveCard = (type: ZoneType, index: number) => {
    if (!fieldBoard) return;

    const updatedBoard = { ...fieldBoard };

    switch (type) {
      case "field":
        updatedBoard.fieldSpell = null;
        break;
      case "extraMonster":
        updatedBoard.extraMonsters[index] = null;
        break;
      case "monster":
        updatedBoard.monsters[index] = null;
        break;
      case "spellTrap":
        updatedBoard.spellTraps[index] = null;
        break;
      case "hand":
        updatedBoard.hand[index] = null;
        break;
      case "graveyard":
        updatedBoard.graveyard = updatedBoard.graveyard.filter(
          (_, i) => i !== index,
        );
        break;
      case "banished":
        updatedBoard.banished = updatedBoard.banished.filter(
          (_, i) => i !== index,
        );
        break;
      case "extraDeck":
        updatedBoard.extraDeck = updatedBoard.extraDeck.filter(
          (_, i) => i !== index,
        );
        break;
    }

    onFieldBoardChange(updatedBoard);
  };

  const handleAddDescription = () => {
    if (fieldBoard) {
      const updatedBoard = { ...fieldBoard, description: "" };
      onFieldBoardChange(updatedBoard);
    }
  };

  const handleRemoveDescription = () => {
    if (fieldBoard) {
      const { description: _description, ...boardWithoutDescription } =
        fieldBoard;
      onFieldBoardChange(boardWithoutDescription as FieldBoard);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newText = e.target.value;
    if (newText.length <= 500 && fieldBoard) {
      const updatedBoard = { ...fieldBoard, description: newText };
      onFieldBoardChange(updatedBoard);
    }
  };

  const getZoneBorderColor = (type: ZoneType) => {
    switch (type) {
      case "field":
        return "border-sky-400/70";
      case "extraMonster":
        return "border-indigo-400/70";
      case "monster":
        return "border-rose-400/70";
      case "spellTrap":
        return "border-cyan-400/70";
      case "banished":
        return "border-fuchsia-600/70";
      case "graveyard":
        return "border-blue-600/70";
      case "hand":
        return "border-violet-400/70";
      case "extraDeck":
        return "border-purple-400/70";
      default:
        return "border-slate-600";
    }
  };

  const getZoneLabel = (type: ZoneType) => {
    switch (type) {
      case "field":
        return "FIELD";
      case "extraMonster":
        return "EXTRA";
      case "monster":
        return "MONSTER";
      case "spellTrap":
        return "SPELL/TRAP";
      case "graveyard":
        return "GRAVEYARD";
      case "banished":
        return "BANISHED";
      case "hand":
        return "HAND";
      case "extraDeck":
        return "EXTRA DECK";
      default:
        return "";
    }
  };

  const renderZone = (
    card: Card | null,
    type: ZoneType,
    index: number,
    label?: string,
  ) => {
    const borderColor = getZoneBorderColor(type);
    const zoneLabel = label || getZoneLabel(type);

    return (
      <div className="relative group w-full h-full">
        {!card && (
          <div className="pointer-events-none absolute inset-0 rounded-[16px] border border-slate-700/70 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-[#140f26] shadow-[inset_0_1px_0_rgba(148,163,184,0.12),0_12px_28px_rgba(2,6,23,0.4)]" />
        )}
        {!card && (
          <div
            className={`pointer-events-none absolute inset-[5px] rounded-[12px] border ${
              isEditMode ? borderColor : "border-slate-700/60"
            } bg-slate-950/20`}
          />
        )}
        {card ? (
          <div className="relative z-10 h-full w-full p-1.5 max-[639px]:p-0.5">
            <div
              className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[12px] border border-slate-700/30 bg-slate-950/90 "
            >
              <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full border border-slate-400/15 bg-slate-950/80 px-1.5 py-0.5 text-[7px] max-[418px]:text-[6px] max-[418px]:px-1 max-[418px]:py-0 max-[370px]:text-[5px] max-[370px]:px-0.5 max-[370px]:py-0 font-semibold tracking-[0.24em] text-slate-300/70">
                {zoneLabel}
              </span>
              <CardTooltip
                cardId={card.id}
                imageUrl={card.imageUrl}
                cardName={card.name}
                containerClassName="w-full h-full"
              >
                <img
                  src={card.imageUrlSmall}
                  alt={card.name}
                  className="h-full w-full object-cover"
                />
              </CardTooltip>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
              {isEditMode && (
                <button
                  onClick={() => handleRemoveCard(type, index)}
                  className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Remove card"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={(e) => {
              if (!isEditMode) return;
              setAnchorElement(e.currentTarget);
              setSelectingZone({ type, index });
            }}
            disabled={!isEditMode}
            className="relative z-10 h-full w-full p-1.5"
          >
            <div
              className={`flex h-full w-full flex-col items-center justify-center rounded-[12px] border ${
                isEditMode ? borderColor : "border-slate-700/60"
              } bg-gradient-to-b from-slate-900/85 via-slate-950/90 to-[#16102a] px-1 transition-all ${
                isEditMode
                  ? "hover:bg-slate-900/95 cursor-pointer"
                  : "cursor-default"
              }`}
            >
              {isEditMode && (
                <Plus className="mb-0.5 h-3 w-3 text-slate-400 group-hover:text-blue-400 sm:mb-1 sm:h-4 sm:w-4" />
              )}
              <span className="text-center tracking-[0.24em] text-slate-400/60 text-[8px] max-[370px]:text-[6px]">
                {zoneLabel}
              </span>
            </div>
          </button>
        )}
      </div>
    );
  };

  const renderHoverPanel = (
    cards: Card[],
    label: string,
    type: "graveyard" | "banished" | "extraDeck",
    position: "left" | "right" = "right",
  ) => (
    <div className={`absolute ${position === "left" ? "right-full mr-2" : "left-full ml-2"} top-0 min-[1024px]:max-[1448px]:right-full min-[1024px]:max-[1448px]:mr-2 min-[1024px]:max-[1448px]:left-auto min-[1024px]:max-[1448px]:ml-0 max-[580px]:fixed max-[580px]:left-1/2 max-[580px]:top-1/2 max-[580px]:-translate-x-1/2 max-[580px]:-translate-y-1/2 max-[580px]:ml-0 z-50 bg-slate-800 border-2 border-slate-600 rounded-lg p-3 shadow-xl min-w-[200px] max-[580px]:min-w-[260px] max-h-[300px] overflow-y-auto`}>
      <div className="text-xs font-bold text-slate-300 mb-2">
        {label}
      </div>
      <div className="space-y-2">
        {cards.map((card, index) => (
          <div
            key={`${type}-hover-${index}`}
            className="relative group/card"
          >
            <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded overflow-hidden">
              <img
                src={card.imageUrlSmall}
                alt={card.name}
                className="w-12 h-16 object-cover rounded"
              />
              <span className="text-xs text-slate-200 flex-1">
                {card.name}
              </span>
              {isEditMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCard(type, index);
                  }}
                  className="w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
                  title="Remove card"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCountZone = (
    cards: Card[],
    type: "graveyard" | "banished" | "extraDeck",
    label: string,
  ) => {
    const borderColor = getZoneBorderColor(type);
    const count = cards.length;
    const firstCard = cards[0];

    return (
      <div className="relative flex flex-col items-center">
        <div
          className="relative group"
          onMouseEnter={() => setHoveringZone(type)}
          onMouseLeave={() => setHoveringZone(null)}
        >
          <div
            className={`relative w-16 h-16 max-[425px]:w-14 max-[425px]:h-14 max-[360px]:w-12 max-[360px]:h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-b from-slate-900 via-slate-950 to-[#140f26] border-2 sm:border-[3px] ${borderColor} rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-transform hover:scale-105 shadow-[inset_0_1px_0_rgba(148,163,184,0.12),0_12px_26px_rgba(2,6,23,0.45)]`}
            style={{
              clipPath:
                "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            }}
            onClick={(e) => {
              if (!isEditMode) return;
              setAnchorElement(e.currentTarget);
              setSelectingZone({ type, index: 0 });
            }}
          >
            {count > 0 && firstCard ? (
              <div className="relative w-full h-full group/card-image">
                <img
                  src={firstCard.imageUrlCropped}
                  alt={firstCard.name}
                  className="w-full h-full object-cover group-hover/card-image:brightness-50"
                />
                {isEditMode && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card-image:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <Plus className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                  </div>
                )}
                {count > 1 && (
                  <div className="absolute top-3 right-2 sm:top-3 sm:right-3 bg-black/75 text-white text-[10px] sm:text-sm px-1 sm:px-1.5 py-0.5 rounded-full">
                    +{count - 1}
                  </div>
                )}
                {isEditMode && count > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCard(type, 0);
                    }}
                    className="absolute top-2 right-3 w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
                    title="Remove card"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                {isEditMode && (
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-blue-400 mb-0.5 sm:mb-1" />
                )}
                <span className="text-[8px] tracking-[0.24em] text-slate-400/60">
                  {label}
                </span>
              </div>
            )}
          </div>

          {hoveringZone === type && count > 0 && renderHoverPanel(cards, label, type)}
        </div>
        <span className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-500 font-bold tracking-wider text-center mt-1">
          {label}
        </span>
      </div>
    );
  };

  const renderExtraDeckZone = (cards: Card[], label: string) => {
    // Optional zone: only render it if it has cards (or it's empty but editable so the admin can add).
    if (cards.length === 0 && !isEditMode) return null;

    const borderColor = getZoneBorderColor("extraDeck");
    const count = cards.length;
    const firstCard = cards[0];

    return (
      <div
        className="relative flex flex-col top-2 lg:top-1 max-[639px]:-left-8 max-[500px]:-left-5 max-[450px]:-left-8 items-center p-1"
        style={{ transform: "rotate(12deg)" }}
      >
        {count === 0 ? (
          <button
            onClick={(e) => {
              setAnchorElement(e.currentTarget);
              setSelectingZone({ type: "extraDeck", index: 0 });
            }}
            className="w-16 max-[639px]:w-14 max-[500px]:w-12 sm:w-16 md:w-20 aspect-[5/7] flex flex-col items-center justify-center gap-0.5 px-1 border-2 border-purple-400/70 rounded-[3px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[8px] max-[639px]:text-[7px] sm:text-[9px] font-semibold text-center leading-tight"
            title="Add extra deck for Pendulum monsters"
          >
            <Plus className="w-3 h-3 shrink-0 sm:w-3.5 sm:h-3.5" />
            <span>EXTRA DECK (PENDULUM)</span>
          </button>
        ) : (
          <>
            <div
              className="relative group before:content-[''] before:absolute before:inset-y-[-5px] before:-left-[-14px] before:-right-[24px] before:rounded-[3px] max-[500px]:before:-left-4 max-[500px]:before:-right-4"
              onMouseEnter={() => setHoveringZone("extraDeck")}
              onMouseLeave={() => setHoveringZone(null)}
            >
              <div
                className={`relative left-[21px] max-[500px]:left-0 w-16 h-[90px] max-[639px]:w-14 max-[639px]:h-[78px] max-[500px]:w-12 max-[500px]:h-[66px] sm:w-16 sm:h-[90px] md:w-[72px] md:h-24 bg-gradient-to-b from-slate-900 via-slate-950 to-[#140f26] border-2 ${borderColor} rounded-[3px] flex items-center justify-center overflow-hidden cursor-pointer shadow-[inset_0_1px_0_rgba(148,163,184,0.12),0_12px_26px_rgba(2,6,23,0.45)]`}
                onClick={(e) => {
                  if (!isEditMode) return;
                  setAnchorElement(e.currentTarget);
                  setSelectingZone({ type: "extraDeck", index: 0 });
                }}
              >
                <div className="relative w-full h-full group/card-image">
                  <img
                    src={firstCard.imageUrlCropped}
                    alt={firstCard.name}
                    className="w-full h-full object-cover"
                  />
                  {count > 1 && (
                    <div className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] sm:text-[10px] px-1 py-0.5 rounded-full">
                      +{count - 1}
                    </div>
                  )}
                  {isEditMode && count > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCard("extraDeck", 0);
                      }}
                      className="absolute top-1 right-1 w-4 h-4 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
                      title="Remove card"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {hoveringZone === "extraDeck" &&
                count > 0 &&
                renderHoverPanel(cards, label, "extraDeck", "left")}
            </div>
            <span
              className="relative left-[19px] z-20 text-[8px] sm:text-[9px] text-purple-400 font-bold tracking-wider text-center mt-2 max-[640px]:ml-1 max-[500px]:-ml-9"
            >
              {label}
            </span>
          </>
        )}
      </div>
    );
  };

  const getCardRotation = (index: number, totalCards: number) => {
    if (totalCards === 1) return 0;
    const maxRotation =
      totalCards === 5
        ? 60
        : totalCards === 4
          ? 50
          : totalCards === 3
            ? 45
            : totalCards === 2
              ? 25
              : 0;
    const step = (maxRotation * 2) / (totalCards - 1);
    return -maxRotation + step * index;
  };

  const getCardTranslateY = (index: number, totalCards: number) => {
    if (totalCards === 1) return 14;
    const center = (totalCards - 1) / 2;
    const distanceFromCenter = Math.abs(index - center);

    const maxElevation =
      totalCards === 5
        ? 22
        : totalCards === 4
          ? 20
          : totalCards === 3
            ? 22
            : totalCards === 2
              ? 15
              : 0;
    const dropFactor =
      totalCards === 5
        ? 3.5
        : totalCards === 4
          ? 3.8
          : totalCards === 3
            ? 4
            : 3;

    return maxElevation - distanceFromCenter * distanceFromCenter * dropFactor;
  };

  if (!fieldBoard) return null;

  const handCards = fieldBoard.hand.filter(
    (card): card is Card => card !== null,
  );
  const hasDescription = fieldBoard.description !== undefined;
  const hasHandCards = handCards.length > 0;

  return (
    <div className="w-full mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-blue-300 max-[500px]:text-sm">
            Final Board Preview for
          </h3>
          {selectedHandTitle && (
            <span className="text-lg font-bold text-yellow-200 max-[500px]:text-sm">
              {selectedHandTitle}
            </span>
          )}
        </div>
      </div>

      <div className="max-[450px]:-mx-4">
        <div className="flex justify-center">
        <div className="relative w-full b min-w-[280px] max-w-[98%] max-[767px]:max-w-full rounded-[22px] border border-blue-500/50 bg-gradient-to-br from-[#090d18] via-[#13182b] to-[#190f30] p-3 shadow-[0_0_40px_rgba(37,99,235,0.1)] sm:max-w-[90%] md:max-w-[80%] md:p-5 min-[1024px]:max-w-full min-[1781px]:max-w-[65%] overflow-visible">
          <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_35%)]" />
          <div className="pointer-events-none absolute inset-x-4 top-4 h-20 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none border-b-0 absolute inset-x-5 max-[450px]:inset-x-0 bottom-10 top-28 max-[450px]:rounded-none rounded-[3px] border border-slate-700/50 bg-gradient-to-t from-slate-950/20 via-slate-950/5 to-indigo-950/20" />
          <div className="pointer-events-none absolute inset-x-10 top-[38%] h-px bg-gradient-to-r from-transparent via-sky-400/15 to-transparent" />
          <div className="pointer-events-none absolute inset-y-28 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-violet-400/10 to-transparent lg:block" />
          <div className="relative z-10">
            {isEditMode && (
              <div className="relative mb-4 sm:mb-6 md:mb-8">
                <button
                  onClick={onDelete}
                  className="absolute top-0 right-0 flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm z-10"
                  title="Delete field preview"
                >
                  <span className="text-red-400 hover:text-red-400/80 active:text-red-500/80">
                    Delete Field
                  </span>
                </button>

                {!hasDescription && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleAddDescription}
                      className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-blue-600/30 border border-blue-500/50 rounded transition-colors text-xs sm:text-sm"
                    >
                      <span className="text-blue-400">Add Description</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {isEditMode && hasDescription && (
              <div className="flex justify-center">
                <div className="w-full sm:w-4/5 md:w-2/3 lg:w-[56%] rounded-[18px] border border-sky-400/15 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-indigo-950/80 p-4 shadow-[0_16px_34px_rgba(2,6,23,0.4)]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                        Description
                      </span>
                      <button
                        onClick={handleRemoveDescription}
                        className="inline-flex text-xs"
                      >
                        <span className="text-red-400 hover:text-red-400/80 active:text-red-500/80">
                          Remove
                        </span>
                      </button>
                    </div>
                    <textarea
                      value={fieldBoard.description || ""}
                      onChange={handleDescriptionChange}
                      placeholder="Add a description for your endboard..."
                      className="scrollbar-homeAllPages w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-3 text-xs text-white shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] focus:border-blue-400 focus:outline-none resize-y sm:px-4 sm:py-4 sm:text-sm"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="text-right text-xs text-slate-400 !mt-0">
                      {fieldBoard.description?.length || 0}/500
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isEditMode && fieldBoard.description && (
              <div className="flex justify-center mb-4">
                <div className="w-full sm:w-4/5 md:w-2/3 lg:w-[56%] max-h-52 overflow-hidden overflow-y-auto scrollbar-homeAllPages rounded-[18px] border border-sky-400/15 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-indigo-950/80 p-4 shadow-[0_16px_34px_rgba(2,6,23,0.4)]">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                      Description
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-sky-400/30 to-transparent" />
                  </div>
                  <p className="text-sm leading-6 text-slate-200/90 whitespace-pre-wrap">
                    {fieldBoard.description}
                  </p>
                </div>
              </div>
            )}

            {/* Horizontal separator */}
            {(hasDescription || (!isEditMode && fieldBoard.description)) && (
              <div className="my-5 border-t border-slate-600/50"></div>
            )}

            <div className="relative">
              {/* Extra Deck Zone - desktop only, at hand-cards height, slightly right */}
              <div
                className={`absolute hidden lg:block ${isEditMode && hasHandCards ? "bottom-14 sm:bottom-16 md:bottom-20" : "bottom-8"} left-6 z-10`}
              >
                {renderExtraDeckZone(fieldBoard.extraDeck, "EXTRA DECK")}
              </div>

              {/* Layout principal - Cambia según el modo responsive */}
              <div
                className={`flex ${isResponsive ? "flex-col" : "flex-col lg:flex-row"} gap-4 max-[425px]:gap-2 sm:gap-6 lg:gap-8 min-[1024px]:max-[1100px]:gap-0 justify-center items-center`}
              >
                {/* Field Spell Zone - standalone, stays in its original position */}
                <div
                  className={`flex-shrink-0 w-14 sm:w-16 md:w-20 lg:w-24 self-center order-1`}
                >
                  <div className="flex-shrink-0 w-full aspect-[5/7]">
                    {renderZone(fieldBoard.fieldSpell, "field", 0)}
                  </div>
                </div>

                {/* Main Board Zones (Extra, Monsters, Spell/Trap) */}
                <div
                  className={`space-y-4 sm:space-y-6 md:space-y-8 ${isResponsive ? "order-2 w-full" : "order-3 lg:order-2"} max-[450px]:w-full`}
                >
                  {/* Extra Monster Zone */}
                  <div className="flex justify-center gap-8 max-[450px]:gap-8 max-[418px]:gap-6 max-[339px]:gap-4 sm:gap-12 md:gap-16 lg:gap-24">
                    <div className="flex-shrink-0 w-16 max-[600px]:w-12 max-[418px]:w-14 max-[370px]:w-12 sm:w-20 md:w-20 lg:w-24 opacity-0 invisible"></div>
                    {fieldBoard.extraMonsters.slice(0, 2).map((card, index) => {
                      const isDef =
                        (fieldBoard.extraMonsterPositions?.[index] ?? 'atk') === 'def';
                      return (
                        <div
                          key={`extra-${index}`}
                          className="flex-shrink-0 relative w-16 max-[600px]:w-12 max-[418px]:w-14 max-[370px]:w-12 sm:w-20 md:w-20 lg:w-24 aspect-[5/7]"
                        >
                          {isEditMode && card && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePosition('extraMonster', index);
                              }}
                              className={`absolute top-0 left-0 z-30 w-5 h-5 rounded-full flex items-center justify-center shadow-md border transition-colors ${
                                isDef
                                  ? 'bg-indigo-600 border-indigo-400 hover:bg-indigo-500'
                                  : 'bg-slate-800/90 border-slate-600 hover:bg-slate-700'
                              }`}
                              title={isDef ? 'Switch to Attack position' : 'Switch to Defense position'}
                            >
                              <RotateCw className={`w-2.5 h-2.5 ${isDef ? 'text-white' : 'text-slate-400'}`} />
                            </button>
                          )}
                          <div
                            className={`w-full h-full transition-transform duration-300 origin-center ${
                              isDef ? '-rotate-90' : ''
                            }`}
                          >
                            {renderZone(card, "extraMonster", index)}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex-shrink-0 w-16 max-[600px]:w-12 max-[418px]:w-14 max-[370px]:w-12 sm:w-20 md:w-20 lg:w-24 opacity-0 invisible"></div>
                  </div>

                  {/* Monster Zones */}
                  <div className="flex justify-center gap-3 max-[450px]:gap-3 max-[418px]:gap-6 max-[385px]:gap-[18px] max-[339px]:gap-4 sm:gap-4 md:gap-6">
                    {fieldBoard.monsters.map((card, index) => {
                      const isDef =
                        (fieldBoard.monsterPositions?.[index] ?? 'atk') === 'def';
                      return (
                        <div
                          key={`monster-${index}`}
                          className="flex-shrink-0 relative w-16 max-[418px]:w-14 max-[370px]:w-12 sm:w-20 md:w-20 lg:w-24 aspect-[5/7]"
                        >
                          {isEditMode && card && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePosition('monster', index);
                              }}
                              className={`absolute top-0 left-0 z-30 w-5 h-5 rounded-full flex items-center justify-center shadow-md border transition-colors ${
                                isDef
                                  ? 'bg-indigo-600 border-indigo-400 hover:bg-indigo-500'
                                  : 'bg-slate-800/90 border-slate-600 hover:bg-slate-700'
                              }`}
                              title={isDef ? 'Switch to Attack position' : 'Switch to Defense position'}
                            >
                              <RotateCw className={`w-2.5 h-2.5 ${isDef ? 'text-white' : 'text-slate-400'}`} />
                            </button>
                          )}
                          <div
                            className={`w-full h-full transition-transform duration-300 origin-center ${
                              isDef ? '-rotate-90' : ''
                            }`}
                          >
                            {renderZone(card, "monster", index)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Spell/Trap Zones */}
                  <div className="flex justify-center gap-3 max-[450px]:gap-3 max-[418px]:gap-6 max-[385px]:gap-[18px] max-[339px]:gap-4 sm:gap-4 md:gap-6">
                    {fieldBoard.spellTraps.map((card, index) => (
                      <div
                        key={`spell-${index}`}
                        className="flex-shrink-0 w-16 max-[418px]:w-14 max-[370px]:w-12 sm:w-20 md:w-20 lg:w-24 aspect-[5/7]"
                      >
                        {renderZone(card, "spellTrap", index)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graveyard and Banished Zones - Responsive positioning */}
                <div
                  className={`
                ${
                  isResponsive
                    ? `relative flex flex-col justify-end items-end gap-4 max-[1023px]:pr-4 max-[500px]:flex-row max-[500px]:items-center ${
                        fieldBoard.extraDeck.length > 0 || isEditMode
                          ? "max-[500px]:justify-end max-[500px]:pr-4"
                          : "max-[500px]:justify-center"
                      } max-[500px]:gap-3 max-[425px]:gap-2 max-[360px]:gap-1 sm:gap-6 w-full order-3 mt-4`
                    : "flex flex-row lg:flex-col gap-4 sm:gap-6 min-[1024px]:max-[1100px]:gap-4 items-center justify-center self-center order-2 lg:order-3"
                }
              `}
                >
                  {isResponsive && (
                    <div className="absolute left-0 max-[1023px]:left-8 max-[639px]:left-9 top-1/2 -translate-y-1/2 pl-1">
                      {renderExtraDeckZone(fieldBoard.extraDeck, "EXTRA DECK")}
                    </div>
                  )}
                  {renderCountZone(fieldBoard.banished, "banished", "BANISH")}
                  {renderCountZone(
                    fieldBoard.graveyard,
                    "graveyard",
                    "GRAVEYARD",
                  )}
                </div>
              </div>

              {/* Hand Zone */}
              <div className={`${hasHandCards ? "mt-8 sm:mt-10 md:mt-12" : "mt-8"} max-[1023px]:-mb-24 max-[1023px]:-translate-y-24 max-[1023px]:z-10 max-[500px]:mb-0 max-[500px]:translate-y-0`}>
                <div className="flex justify-center">
                  <div
                    className={`relative bottom-5 flex w-full justify-center items-end rounded-[18px] px-4 ${hasHandCards ? "h-24 sm:h-28 md:h-32" : "h-12 sm:h-14 md:h-16"}`}
                  >
                    {handCards.length === 0 && !isEditMode ? (
                      <div className="text-gray-500 text-xs sm:text-sm">
                        No cards in hand
                      </div>
                    ) : handCards.length === 0 && isEditMode ? (
                      <div className="text-gray-500 text-xs sm:text-sm">
                        No cards in hand
                      </div>
                    ) : (
                      <>
                        {handCards.map((card, cardIndex) => {
                          const rotation = getCardRotation(
                            cardIndex,
                            handCards.length,
                          );
                          const translateY = getCardTranslateY(
                            cardIndex,
                            handCards.length,
                          );
                          const zIndex = cardIndex;
                          const spacingScale =
                            handCards.length === 5
                              ? 22
                              : handCards.length === 4
                                ? 21
                                : handCards.length === 3
                                  ? 24
                                  : handCards.length === 2
                                    ? 18
                                    : 0;
                          const horizontalOffset =
                            (cardIndex - (handCards.length - 1) / 2) *
                            spacingScale;

                          return (
                            <div
                              key={`hand-${card.id}-${cardIndex}`}
                              className="absolute group"
                              style={{
                                transform: `translateX(${horizontalOffset}px) translateY(-${translateY}px) rotate(${rotation}deg)`,
                                transformOrigin: "center bottom",
                                zIndex: zIndex,
                                transition: "transform 0.3s ease",
                                bottom: !isEditMode && handCards.length === 5 ? "12px" : "0",
                              }}
                            >
                              <CardTooltip
                                cardId={card.id}
                                imageUrl={card.imageUrl}
                                cardName={card.name}
                              >
                                <img
                                  src={card.imageUrlSmall}
                                  alt={card.name}
                                  className={`${!isEditMode && handCards.length === 5 ? "w-12 h-[68px] sm:w-14 sm:h-20 md:w-16 md:h-24" : "w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28"} object-cover hover:scale-110 hover:-translate-y-4 sm:hover:-translate-y-6 transition-all`}
                                />
                              </CardTooltip>

                              {isEditMode && (
                                <button
                                  onClick={() => {
                                    const actualIndex =
                                      fieldBoard.hand.findIndex(
                                        (c) => c === card,
                                      );
                                    if (actualIndex !== -1) {
                                      handleRemoveCard("hand", actualIndex);
                                    }
                                  }}
                                  className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-[9999] group-hover:-translate-y-4 sm:group-hover:-translate-y-6"
                                  title="Remove card"
                                >
                                  <X className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>

                {isEditMode && (
                  <div className="flex justify-center mt-4 sm:mt-6">
                    <button
                      onClick={(e) => {
                        const firstEmptyIndex = fieldBoard.hand.findIndex(
                          (c) => c === null,
                        );
                        if (firstEmptyIndex !== -1) {
                          setAnchorElement(e.currentTarget);
                          setSelectingZone({
                            type: "hand",
                            index: firstEmptyIndex,
                          });
                        }
                      }}
                      disabled={handCards.length >= 5}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 border-2 rounded flex items-center justify-center gap-1.5 sm:gap-2 transition-colors ${
                        handCards.length >= 5
                          ? "opacity-50 cursor-not-allowed border-slate-600"
                          : "border-pink-400/60 hover:border-pink-400 hover:bg-pink-400/10"
                      }`}
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                      <span className="text-pink-400 text-xs sm:text-sm">
                        Add Card to Hand ({handCards.length}/5)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <FloatingCardSearchModal
        isOpen={!!selectingZone}
        onClose={() => {
          setSelectingZone(null);
          setAnchorElement(null);
        }}
        onSelectCard={handleCardSelected}
        title="Select Card for Field"
        anchorElement={anchorElement}
        autoCloseAfterSelect={true}
      />
    </div>
  );
};
