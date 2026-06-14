import { describe, it, expect } from "vitest";
import {
  getStepsInOrder,
  getVisibleSteps,
  createComboStep,
  hasCanceledFlow,
  removeStepAndReorder,
  swapStepsWithinFlow,
} from "../comboStepEditorUtils";
import type { ComboStep } from "@/features/archetypes/types";

function makeStep(overrides: Partial<ComboStep> = {}): ComboStep {
  return {
    id: "step-1",
    stepOrder: 0,
    description: "",
    parentCanceledStepId: null,
    mainCards: [],
    subCards: [],
    leftSubCards: [],
    ...overrides,
  };
}

describe("getStepsInOrder", () => {
  it("should filter and sort by parentId", () => {
    const steps: ComboStep[] = [
      makeStep({ id: "a", stepOrder: 2, parentCanceledStepId: null }),
      makeStep({ id: "b", stepOrder: 1, parentCanceledStepId: null }),
      makeStep({ id: "c", stepOrder: 0, parentCanceledStepId: "parent" }),
    ];

    const result = getStepsInOrder(steps, null);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("b");
    expect(result[1].id).toBe("a");
  });
});

describe("getVisibleSteps", () => {
  it("should return main flow steps when no canceled branch active", () => {
    const steps: ComboStep[] = [
      makeStep({ id: "a", stepOrder: 0 }),
      makeStep({ id: "b", stepOrder: 1 }),
    ];

    const result = getVisibleSteps(steps, null);

    expect(result).toHaveLength(2);
  });

  it("should include canceled branch steps when active", () => {
    const steps: ComboStep[] = [
      makeStep({ id: "main1", stepOrder: 0 }),
      makeStep({ id: "main2", stepOrder: 1 }),
      makeStep({ id: "cancel-1", stepOrder: 0, parentCanceledStepId: "main2" }),
      makeStep({ id: "cancel-2", stepOrder: 1, parentCanceledStepId: "main2" }),
      makeStep({ id: "main3", stepOrder: 2 }),
    ];

    const result = getVisibleSteps(steps, "main2");

    // Should include main1, main2, then cancel-1, cancel-2 (but NOT main3)
    expect(result[0].id).toBe("main1");
    expect(result[1].id).toBe("main2");
    expect(result[2].id).toBe("cancel-1");
    expect(result[3].id).toBe("cancel-2");
    expect(result.length).toBe(4);
  });
});

describe("createComboStep", () => {
  it("should create a step with next order in the branch", () => {
    const steps: ComboStep[] = [
      makeStep({ id: "a", stepOrder: 0 }),
      makeStep({ id: "b", stepOrder: 1 }),
    ];

    const newStep = createComboStep(steps, null);

    expect(newStep.stepOrder).toBe(2);
    expect(newStep.parentCanceledStepId).toBeNull();
    expect(newStep.mainCards).toEqual([]);
    expect(newStep.id).toMatch(/^step-/);
  });

  it("should start at order 0 for empty branch", () => {
    const newStep = createComboStep([], "parent-id");

    expect(newStep.stepOrder).toBe(0);
    expect(newStep.parentCanceledStepId).toBe("parent-id");
  });
});

describe("hasCanceledFlow", () => {
  it("should detect canceled flow branch", () => {
    const steps: ComboStep[] = [
      makeStep({ id: "main1" }),
      makeStep({ id: "cancel1", parentCanceledStepId: "main1" }),
    ];

    expect(hasCanceledFlow(steps, "main1")).toBe(true);
    expect(hasCanceledFlow(steps, "cancel1")).toBe(false);
  });
});

describe("removeStepAndReorder", () => {
  it("should remove a main flow step and its canceled branch", () => {
    const steps: ComboStep[] = [
      makeStep({ id: "main1", stepOrder: 0 }),
      makeStep({ id: "main2", stepOrder: 1 }),
      makeStep({ id: "cancel2a", stepOrder: 0, parentCanceledStepId: "main2" }),
      makeStep({ id: "main3", stepOrder: 2 }),
    ];

    const result = removeStepAndReorder(steps, "main2");

    // main2 and cancel2a should be removed. main1 (order 0), main3 (order 1)
    expect(result.length).toBe(2);
    const main1 = result.find((s) => s.id === "main1")!;
    const main3 = result.find((s) => s.id === "main3")!;
    expect(main1.stepOrder).toBe(0);
    expect(main3.stepOrder).toBe(1);
  });

  it("should remove only a canceled step", () => {
    const steps: ComboStep[] = [
      makeStep({ id: "main1", stepOrder: 0 }),
      makeStep({ id: "cancel1a", stepOrder: 0, parentCanceledStepId: "main1" }),
      makeStep({ id: "cancel1b", stepOrder: 1, parentCanceledStepId: "main1" }),
    ];

    const result = removeStepAndReorder(steps, "cancel1a");

    expect(result.length).toBe(2);
    const remainingCancel = result.find((s) => s.id === "cancel1b")!;
    expect(remainingCancel.stepOrder).toBe(0);
  });
});

describe("swapStepsWithinFlow", () => {
  it("should swap two steps within the same branch", () => {
    const steps: ComboStep[] = [
      makeStep({ id: "a", stepOrder: 0 }),
      makeStep({ id: "b", stepOrder: 1 }),
      makeStep({ id: "c", stepOrder: 2 }),
    ];

    const result = swapStepsWithinFlow(steps, "a", "c", null);

    const a = result.find((s) => s.id === "a")!;
    const c = result.find((s) => s.id === "c")!;
    const b = result.find((s) => s.id === "b")!;
    expect(a.stepOrder).toBe(2);
    expect(c.stepOrder).toBe(0);
    expect(b.stepOrder).toBe(1);
  });

  it("should not swap steps from different branches", () => {
    const steps: ComboStep[] = [
      makeStep({ id: "a", stepOrder: 0 }),
      makeStep({ id: "b", stepOrder: 0, parentCanceledStepId: "a" }),
    ];

    const result = swapStepsWithinFlow(steps, "a", "b", null);

    // Should return unchanged since they are in different branches
    expect(result).toBe(steps);
  });
});
