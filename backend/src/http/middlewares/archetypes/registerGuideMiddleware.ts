import { Request, Response, NextFunction } from "express";

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

const validateNullableCardIdArray = (
  value: unknown,
  expectedLength: number,
): boolean =>
  Array.isArray(value) &&
  value.length === expectedLength &&
  value.every((entry) => entry === null || isPositiveInteger(entry));

const validateCardIdArray = (value: unknown): boolean =>
  Array.isArray(value) && value.every((entry) => isPositiveInteger(entry));

const validateFinalBoard = (finalBoard: unknown, index: number): string | null => {
  // Validate the persisted board shape early so registerGuide only receives normalized data.
  if (typeof finalBoard !== "object" || finalBoard === null) {
    return `Invalid finalBoard at initialHands index ${index}`;
  }

  const board = finalBoard as Record<string, unknown>;

  if (
    board.fieldSpellCardId !== null &&
    board.fieldSpellCardId !== undefined &&
    !isPositiveInteger(board.fieldSpellCardId)
  ) {
    return `Invalid fieldSpellCardId at initialHands index ${index}`;
  }

  if (!validateNullableCardIdArray(board.extraMonsterCardIds, 2)) {
    return `extraMonsterCardIds must contain exactly 2 nullable card IDs at initialHands index ${index}`;
  }

  if (!validateNullableCardIdArray(board.monsterCardIds, 5)) {
    return `monsterCardIds must contain exactly 5 nullable card IDs at initialHands index ${index}`;
  }

  if (!validateNullableCardIdArray(board.spellTrapCardIds, 5)) {
    return `spellTrapCardIds must contain exactly 5 nullable card IDs at initialHands index ${index}`;
  }

  if (!validateNullableCardIdArray(board.handCardIds, 5)) {
    return `handCardIds must contain exactly 5 nullable card IDs at initialHands index ${index}`;
  }

  if (!validateCardIdArray(board.graveyardCardIds)) {
    return `graveyardCardIds must contain valid card IDs at initialHands index ${index}`;
  }

  if (!validateCardIdArray(board.banishedCardIds)) {
    return `banishedCardIds must contain valid card IDs at initialHands index ${index}`;
  }

  if (
    board.description !== undefined &&
    (typeof board.description !== "string" || board.description.length > 500)
  ) {
    return `finalBoard description must be a string with at most 500 characters at initialHands index ${index}`;
  }

  return null;
};

export const registerGuideMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const id = req.params.id;
  if (typeof id !== "string") {
    res.status(400).json({ success: false, error: "Invalid archetype ID" });
    return;
  }
  const archetypeId = parseInt(id);
  const { guideType, cardPairs, initialHands, headerCardId } = req.body;

  // Validate that the archetype ID is valid
  if (!archetypeId || isNaN(archetypeId) || archetypeId <= 0) {
    res.status(400).json({
      success: false,
      error: "Invalid archetype ID",
    });
    return;
  }

  // Validate guideType
  if (!guideType || (guideType !== "COUNTER" && guideType !== "DECK")) {
    res.status(400).json({
      success: false,
      error: "guideType must be either 'COUNTER' or 'DECK'",
    });
    return;
  }

  // Validate according to guide type
  if (guideType === "COUNTER") {
    // For Counter Guides, cardPairs must be present and is an array
    if (!cardPairs || !Array.isArray(cardPairs)) {
      res.status(400).json({
        success: false,
        error: "cardPairs must be an array for Counter Guides",
      });
      return;
    }

    // If there are pairs, validate the structure of each pair
    for (let i = 0; i < cardPairs.length; i++) {
      const pair = cardPairs[i];

      // At least one card in top or bottom
      if (
        (!pair.topCardIds ||
          !Array.isArray(pair.topCardIds) ||
          pair.topCardIds.length === 0) &&
        (!pair.bottomCardIds ||
          !Array.isArray(pair.bottomCardIds) ||
          pair.bottomCardIds.length === 0)
      ) {
        res.status(400).json({
          success: false,
          error: `Each pair must have at least one card in top or bottom at index ${i}`,
        });
        return;
      }

      // Validate max cards
      if (pair.topCardIds && pair.topCardIds.length > 8) {
        res.status(400).json({
          success: false,
          error: `Maximum 8 top cards allowed per pair at index ${i}`,
        });
        return;
      }

      if (pair.bottomCardIds && pair.bottomCardIds.length > 8) {
        res.status(400).json({
          success: false,
          error: `Maximum 8 bottom cards allowed per pair at index ${i}`,
        });
        return;
      }

      // Validate each card ID is a valid number
      if (pair.topCardIds) {
        for (const cardId of pair.topCardIds) {
          if (typeof cardId !== "number" || cardId <= 0) {
            res.status(400).json({
              success: false,
              error: `Invalid card ID in topCardIds at pair index ${i}`,
            });
            return;
          }
        }
      }

      if (pair.bottomCardIds) {
        for (const bottomCard of pair.bottomCardIds) {
          // Validate bottomCard is an object with cardId
          if (typeof bottomCard !== "object" || !bottomCard.cardId) {
            res.status(400).json({
              success: false,
              error: `Invalid bottom card format at pair index ${i}. Expected { cardId, effectiveness? }`,
            });
            return;
          }

          if (typeof bottomCard.cardId !== "number" || bottomCard.cardId <= 0) {
            res.status(400).json({
              success: false,
              error: `Invalid card ID in bottomCardIds at pair index ${i}`,
            });
            return;
          }

          // Validate effectiveness if provided
          if (bottomCard.effectiveness !== undefined && bottomCard.effectiveness !== null) {
            const validEffectiveness = ["BAD", "MEDIUM", "EFFECTIVE", "VERY_EFFECTIVE"];
            if (typeof bottomCard.effectiveness !== "string" || !validEffectiveness.includes(bottomCard.effectiveness)) {
              res.status(400).json({
                success: false,
                error: `Invalid effectiveness value at pair index ${i}. Must be one of: ${validEffectiveness.join(", ")}`,
              });
              return;
            }
          }
        }
      }
    }
  } else if (guideType === "DECK") {
    // For Deck Guides, initialHands must be an array (can be empty if guide has only a recommended deck)
    if (!Array.isArray(req.body.initialHands)) {
      res.status(400).json({
        success: false,
        error: "initialHands must be an array for Deck Guides",
      });
      return;
    }

    // Validate the structure of each initial hand
    for (let i = 0; i < initialHands.length; i++) {
      const hand = initialHands[i];

      // Must have cardIds array
      if (!hand.cardIds || !Array.isArray(hand.cardIds) || hand.cardIds.length === 0) {
        res.status(400).json({
          success: false,
          error: `Each initial hand must have at least one card at index ${i}`,
        });
        return;
      }

      // Validate each card ID is a valid number
      for (const cardId of hand.cardIds) {
        if (typeof cardId !== "number" || cardId <= 0) {
          res.status(400).json({
            success: false,
            error: `Invalid card ID in initialHands at index ${i}`,
          });
          return;
        }
      }

      if (
        hand.description !== undefined &&
        (typeof hand.description !== "string" || hand.description.length > 50)
      ) {
        res.status(400).json({
          success: false,
          error: `Description must be a string with at most 50 characters in initialHands at index ${i}`,
        });
        return;
      }

      if (hand.finalBoard !== undefined) {
        const finalBoardError = validateFinalBoard(hand.finalBoard, i);
        if (finalBoardError) {
          res.status(400).json({
            success: false,
            error: finalBoardError,
          });
          return;
        }
      }
    }

    // Validate combo steps if provided (optional for DECK guides)
    const { comboSteps } = req.body;
    if (comboSteps !== undefined) {
      if (!Array.isArray(comboSteps)) {
        res.status(400).json({
          success: false,
          error: "comboSteps must be an array",
        });
        return;
      }

      for (let i = 0; i < comboSteps.length; i++) {
        const handCombo = comboSteps[i];

        // Validate initialHandId (index in initialHands array)
        if (typeof handCombo.initialHandId !== "number" || handCombo.initialHandId < 0) {
          res.status(400).json({
            success: false,
            error: `Invalid initialHandId at comboSteps index ${i}`,
          });
          return;
        }

        // Validate steps array
        if (!handCombo.steps || !Array.isArray(handCombo.steps)) {
          res.status(400).json({
            success: false,
            error: `comboSteps at index ${i} must have a steps array`,
          });
          return;
        }

        for (let j = 0; j < handCombo.steps.length; j++) {
          const step = handCombo.steps[j];

          // Validate mainCardIds (required, at least 1 card)
          if (!step.mainCardIds || !Array.isArray(step.mainCardIds) || step.mainCardIds.length === 0) {
            res.status(400).json({
              success: false,
              error: `Each combo step must have at least one main card (comboSteps[${i}].steps[${j}])`,
            });
            return;
          }

          // Validate each main card ID
          for (const cardId of step.mainCardIds) {
            if (typeof cardId !== "number" || cardId <= 0) {
              res.status(400).json({
                success: false,
                error: `Invalid card ID in mainCardIds at comboSteps[${i}].steps[${j}]`,
              });
              return;
            }
          }

          // Validate subCardIds (optional, max 5 cards)
          if (step.subCardIds !== undefined) {
            if (!Array.isArray(step.subCardIds)) {
              res.status(400).json({
                success: false,
                error: `subCardIds must be an array at comboSteps[${i}].steps[${j}]`,
              });
              return;
            }

            if (step.subCardIds.length > 5) {
              res.status(400).json({
                success: false,
                error: `Each combo step can have at most 5 sub cards (comboSteps[${i}].steps[${j}])`,
              });
              return;
            }

            // Validate each sub card ID
            for (const cardId of step.subCardIds) {
              if (typeof cardId !== "number" || cardId <= 0) {
                res.status(400).json({
                  success: false,
                  error: `Invalid card ID in subCardIds at comboSteps[${i}].steps[${j}]`,
                });
                return;
              }
            }
          }

          // Validate stepOrder
          if (typeof step.stepOrder !== "number" || step.stepOrder < 0) {
            res.status(400).json({
              success: false,
              error: `Invalid stepOrder at comboSteps[${i}].steps[${j}]`,
            });
            return;
          }

          // Validate description (optional)
          if (step.description !== undefined && typeof step.description !== "string") {
            res.status(400).json({
              success: false,
              error: `description must be a string at comboSteps[${i}].steps[${j}]`,
            });
            return;
          }

          // Validate parentCanceledStepIndex (optional)
          if (step.parentCanceledStepIndex !== undefined && typeof step.parentCanceledStepIndex !== "number") {
            res.status(400).json({
              success: false,
              error: `parentCanceledStepIndex must be a number at comboSteps[${i}].steps[${j}]`,
            });
            return;
          }
        }
      }
    }
  }

  // Validate headerCardId if it is present
  if (
    headerCardId !== undefined &&
    (typeof headerCardId !== "number" || headerCardId <= 0)
  ) {
    res.status(400).json({
      success: false,
      error: "headerCardId must be a valid positive number",
    });
    return;
  }

  next();
};
