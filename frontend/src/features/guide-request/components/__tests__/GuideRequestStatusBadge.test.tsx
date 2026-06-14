import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuideRequestStatusBadge } from "../GuideRequestStatusBadge";

describe("GuideRequestStatusBadge", () => {
  it("should render 'Open' for OPEN status", () => {
    render(<GuideRequestStatusBadge status="OPEN" />);
    expect(screen.getByText("Open")).toBeDefined();
  });

  it("should render 'In Progress' for TAKEN status", () => {
    render(<GuideRequestStatusBadge status="TAKEN" />);
    expect(screen.getByText("In Progress")).toBeDefined();
  });

  it("should render 'Completed' for COMPLETED status", () => {
    render(<GuideRequestStatusBadge status="COMPLETED" />);
    expect(screen.getByText("Completed")).toBeDefined();
  });

  it("should apply default size class (sm)", () => {
    render(<GuideRequestStatusBadge status="OPEN" />);
    const badge = screen.getByText("Open");
    expect(badge.className).toContain("text-xs");
    expect(badge.className).toContain("px-2");
  });

  it("should apply xs size class when size=xs", () => {
    render(<GuideRequestStatusBadge status="OPEN" size="xs" />);
    const badge = screen.getByText("Open");
    expect(badge.className).toContain("text-[10px]");
    expect(badge.className).toContain("px-1.5");
  });

  it("should apply emerald color for OPEN", () => {
    render(<GuideRequestStatusBadge status="OPEN" />);
    const badge = screen.getByText("Open");
    expect(badge.className).toContain("bg-emerald");
    expect(badge.className).toContain("text-emerald");
  });

  it("should apply indigo color for TAKEN", () => {
    render(<GuideRequestStatusBadge status="TAKEN" />);
    const badge = screen.getByText("In Progress");
    expect(badge.className).toContain("bg-indigo");
    expect(badge.className).toContain("text-indigo");
  });

  it("should apply amber color for COMPLETED", () => {
    render(<GuideRequestStatusBadge status="COMPLETED" />);
    const badge = screen.getByText("Completed");
    expect(badge.className).toContain("bg-amber");
    expect(badge.className).toContain("text-amber");
  });
});
