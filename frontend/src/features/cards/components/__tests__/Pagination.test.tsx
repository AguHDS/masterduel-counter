import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "../Pagination";

describe("Pagination", () => {
  it("should render all pages when totalPages <= 7", () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
    // No ellipsis
    expect(screen.queryByText("...")).toBeNull();
  });

  it("should show ellipsis at end when on first pages", () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={vi.fn()} />);

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("10")).toBeDefined();
    // Ellipsis should appear
    expect(screen.getByText("...")).toBeDefined();
  });

  it("should show ellipsis on both sides when in middle", () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />);

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("6")).toBeDefined();
    // Two ellipsis
    const ellipsis = screen.getAllByText("...");
    expect(ellipsis.length).toBe(2);
  });

  it("should show ellipsis at start when on last pages", () => {
    render(<Pagination currentPage={10} totalPages={10} onPageChange={vi.fn()} />);

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("9")).toBeDefined();
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("...")).toBeDefined();
  });

  it("should return null when totalPages <= 1", () => {
    render(<Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />);

    // Should not render anything
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("should call onPageChange with correct page when clicking", async () => {
    const onPageChange = vi.fn();

    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByText("4"));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("should highlight current page", () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);

    const currentBtn = screen.getByText("3");
    expect(currentBtn.className).toContain("bg-cyan-600");
  });
});
