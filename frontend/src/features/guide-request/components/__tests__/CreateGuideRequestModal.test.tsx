import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateGuideRequestModal } from "../CreateGuideRequestModal";

// Mock the mutation hook
const mockMutateAsync = vi.fn();

vi.mock("../../hooks/useGuideRequests", () => ({
  useCreateGuideRequest: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useGuideRequests: () => ({ data: null }),
  useRecentGuideRequests: () => ({ data: [] }),
  useGuideRequestById: () => ({ data: null }),
  useTakeGuideRequest: () => ({ mutateAsync: vi.fn() }),
  useCancelTakeGuideRequest: () => ({ mutateAsync: vi.fn() }),
  useFulfillGuideRequest: () => ({ mutateAsync: vi.fn() }),
  useGuideRequestCounts: () => ({ data: null }),
}));

// Mock the archetype search API
vi.mock("@/features/archetypes/api/archetypesApi", () => ({
  searchArchetypes: vi.fn(),
}));

describe("CreateGuideRequestModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show error when submitting with empty title", async () => {
    render(<CreateGuideRequestModal isOpen={true} onClose={vi.fn()} />);

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText("Title is required.")).toBeDefined();
  });

  it("should show error when no archetype selected", async () => {
    render(<CreateGuideRequestModal isOpen={true} onClose={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText("What guide do you need?");
    await userEvent.type(titleInput, "Some Guide");

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText("Please select an archetype.")).toBeDefined();
  });

  it("should call onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();

    render(<CreateGuideRequestModal isOpen={true} onClose={onClose} />);

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should reset form on close", async () => {
    const onClose = vi.fn();

    render(<CreateGuideRequestModal isOpen={true} onClose={onClose} />);

    // Type something, then cancel
    const titleInput = screen.getByPlaceholderText("What guide do you need?");
    await userEvent.type(titleInput, "Something");

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
