import { Request, Response, NextFunction } from "express";

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
        for (const cardId of pair.bottomCardIds) {
          if (typeof cardId !== "number" || cardId <= 0) {
            res.status(400).json({
              success: false,
              error: `Invalid card ID in bottomCardIds at pair index ${i}`,
            });
            return;
          }
        }
      }
    }
  } else if (guideType === "DECK") {
    // For Deck Guides, initialHands must be present and is an array
    if (!initialHands || !Array.isArray(initialHands)) {
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
