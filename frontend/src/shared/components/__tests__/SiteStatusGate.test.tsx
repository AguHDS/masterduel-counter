import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SiteStatusGate } from "../SiteStatusGate";
import type { SiteStatus } from "@/features/admin-panel/types/adminPanelTypes";

const authMock = vi.hoisted(() => ({ useAuth: vi.fn() }));
vi.mock("@/features/auth", () => ({ useAuth: authMock.useAuth }));

const hooksMock = vi.hoisted(() => ({
  useSiteStatus: vi.fn(),
  isSiteInMaintenance: vi.fn(),
}));
vi.mock("@/features/admin-panel/hooks/useServerManagement", () => hooksMock);

function renderGate(pathname = "/", userRole?: string, status?: SiteStatus | null) {
  authMock.useAuth.mockReturnValue({ user: userRole ? { role: userRole } : null });
  hooksMock.isSiteInMaintenance.mockImplementation((s) => Boolean(s?.maintenance));
  hooksMock.useSiteStatus.mockReturnValue({ data: status });

  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <SiteStatusGate>
        <div>CHILDREN CONTENT</div>
      </SiteStatusGate>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SiteStatusGate", () => {
  it("should show the maintenance screen to non-admins when maintenance is on", () => {
    renderGate("/", "user", { success: true, maintenance: true, message: null });

    expect(screen.getByText("We're doing some improvements")).toBeDefined();
    expect(screen.queryByText("CHILDREN CONTENT")).toBeNull();
  });

  it("should let admins through and show the maintenance banner", () => {
    renderGate("/", "admin", { success: true, maintenance: true, message: null });

    expect(screen.getByText("CHILDREN CONTENT")).toBeDefined();
    expect(screen.getByText(/Maintenance mode is active/)).toBeDefined();
  });

  it("should render children when maintenance is off", () => {
    renderGate("/", "user", { success: true, maintenance: false, message: null });

    expect(screen.getByText("CHILDREN CONTENT")).toBeDefined();
    expect(screen.queryByText(/Maintenance mode is active/)).toBeNull();
  });

  it("should render children on auth routes even during maintenance", () => {
    renderGate("/signin", "user", { success: true, maintenance: true, message: null });

    expect(screen.getByText("CHILDREN CONTENT")).toBeDefined();
    expect(screen.queryByText("We're doing some improvements")).toBeNull();
  });

  it("should render children when status is unknown (e.g. backend restarting)", () => {
    renderGate("/", "user", undefined);

    expect(screen.getByText("CHILDREN CONTENT")).toBeDefined();
  });
});