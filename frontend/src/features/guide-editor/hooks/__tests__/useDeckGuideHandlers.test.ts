import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState } from "react";
import { useDeckGuideHandlers } from "../deck-guides/useDeckGuideHandlers";
import type { ComboStep } from "@/features/archetypes/types";
import type { InitialHand } from "../../components/deck-guides/InitialHandsEditor";

function makeStep(overrides: Partial<ComboStep> = {}): ComboStep {
  return {
    id: `step-${Math.random()}`,
    stepOrder: 0,
    description: "NS Aleister",
    parentCanceledStepId: null,
    mainCards: [],
    subCards: [],
    leftSubCards: [],
    ...overrides,
  };
}

function Wrapper() {
  const [initialHands, setInitialHands] = useState<InitialHand[]>([
    { id: "hand-1", cards: [] },
  ]);
  const [comboSteps, setComboSteps] = useState<Map<string, ComboStep[]>>(
    new Map([["hand-1", [makeStep({ id: "step-a", stepOrder: 0 })]]]),
  );
  const [selectedHandId, setSelectedHandId] = useState<string | null>(null);
  const [_showComboFlow, setShowComboFlow] = useState(false);

  const handlers = useDeckGuideHandlers({
    initialHands,
    setInitialHands,
    comboSteps,
    setComboSteps,
    selectedHandId,
    setSelectedHandId,
    setShowComboFlow,
  });

  return { initialHands, comboSteps, selectedHandId, handlers };
}

describe("useDeckGuideHandlers", () => {
  it("should add a new initial hand", () => {
    const { result } = renderHook(() => Wrapper());

    act(() => {
      result.current.handlers.addInitialHand();
    });

    expect(result.current.initialHands).toHaveLength(2);
    expect(result.current.initialHands[1].id).toMatch(/^hand-/);
  });

  it("should select a hand", () => {
    const { result } = renderHook(() => Wrapper());

    act(() => {
      result.current.handlers.handleSelectHand("hand-1");
    });

    expect(result.current.selectedHandId).toBe("hand-1");
  });

  it("should duplicate combo steps with new IDs", () => {
    const { result } = renderHook(() => Wrapper());

    act(() => {
      result.current.handlers.addInitialHand(); // creates hand-2
    });

    const hand2Id = result.current.initialHands[1].id;

    act(() => {
      result.current.handlers.handleDuplicateInitialHand("hand-1", hand2Id);
    });

    // hand-2 should now have a copy of hand-1's steps
    const originalSteps = result.current.comboSteps.get("hand-1")!;
    const duplicatedSteps = result.current.comboSteps.get(hand2Id)!;

    expect(duplicatedSteps).toBeDefined();
    expect(duplicatedSteps.length).toBe(originalSteps.length);

    // IDs should be different (deep copy, not reference sharing)
    expect(duplicatedSteps[0].id).not.toBe(originalSteps[0].id);

    // But description and other fields should match
    expect(duplicatedSteps[0].description).toBe(originalSteps[0].description);
  });

  it("editing duplicated steps should NOT affect original (deep copy)", () => {
    const { result } = renderHook(() => Wrapper());

    act(() => {
      result.current.handlers.addInitialHand();
    });

    const hand2Id = result.current.initialHands[1].id;

    act(() => {
      result.current.handlers.handleDuplicateInitialHand("hand-1", hand2Id);
    });

    // Select hand-2 and modify its steps
    act(() => {
      result.current.handlers.handleSelectHand(hand2Id);
    });

    // Get the original description before modification
    const originalDesc = result.current.comboSteps.get("hand-1")![0].description;

    // Modify selected hand's steps
    act(() => {
      result.current.handlers.setComboStepsForSelectedHand((prev) => [
        { ...prev[0], description: "Modified Description" },
      ]);
    });

    // Original hand-1 steps should be UNCHANGED
    const hand1Steps = result.current.comboSteps.get("hand-1")!;
    expect(hand1Steps[0].description).toBe(originalDesc);

    // Hand-2 steps should be CHANGED
    const hand2Steps = result.current.comboSteps.get(hand2Id)!;
    expect(hand2Steps[0].description).toBe("Modified Description");
  });
});
