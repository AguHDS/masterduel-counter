import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import {
  useSiteStatus,
  useServerState,
  useStartServerTask,
  useCancelServerTask,
  useSetServerMaintenance,
  useRestartServer,
  isSiteInMaintenance,
} from "../useServerManagement";
import type { ServerStateResponse } from "../../types/adminPanelTypes";

const adminApiMock = vi.hoisted(() => ({
  getServerState: vi.fn(),
  getSiteStatus: vi.fn(),
  startServerTask: vi.fn(),
  cancelServerTask: vi.fn(),
  setServerMaintenance: vi.fn(),
  restartServer: vi.fn(),
}));

vi.mock("../../api/adminApi", () => ({ adminApi: adminApiMock }));

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

const sampleState: ServerStateResponse = {
  success: true,
  maintenance: { enabled: false, message: null, auto: false },
  task: null,
  lastTask: null,
  logTail: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("isSiteInMaintenance", () => {
  it("should evaluate the maintenance flag correctly", () => {
    expect(isSiteInMaintenance({ success: true, maintenance: true, message: null })).toBe(true);
    expect(isSiteInMaintenance({ success: true, maintenance: false, message: null })).toBe(false);
    expect(isSiteInMaintenance(undefined)).toBe(false);
    expect(isSiteInMaintenance(null)).toBe(false);
  });
});

describe("useSiteStatus", () => {
  it("should fetch and return the site status", async () => {
    adminApiMock.getSiteStatus.mockResolvedValueOnce({
      success: true,
      maintenance: true,
      message: "down",
    });

    const { result } = renderHook(() => useSiteStatus(), { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminApiMock.getSiteStatus).toHaveBeenCalled();
    expect(result.current.data).toEqual({ success: true, maintenance: true, message: "down" });
  });
});

describe("useServerState", () => {
  it("should fetch and return the server state", async () => {
    adminApiMock.getServerState.mockResolvedValueOnce(sampleState);

    const { result } = renderHook(() => useServerState(), { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminApiMock.getServerState).toHaveBeenCalled();
    expect(result.current.data).toEqual(sampleState);
  });
});

describe("useStartServerTask", () => {
  it("should call the api with type and options", async () => {
    adminApiMock.startServerTask.mockResolvedValueOnce({ task: { id: "t1" } });

    const { result } = renderHook(() => useStartServerTask(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ type: "download-cards", options: { delay: 250, limit: 10 } });
    });

    expect(adminApiMock.startServerTask).toHaveBeenCalledWith(
      "download-cards",
      { delay: 250, limit: 10 },
    );
  });

  it("should pass no options when not provided", async () => {
    adminApiMock.startServerTask.mockResolvedValueOnce({ task: { id: "t2" } });

    const { result } = renderHook(() => useStartServerTask(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ type: "populate-archetypes" });
    });

    expect(adminApiMock.startServerTask).toHaveBeenCalledWith("populate-archetypes", undefined);
  });
});

describe("useCancelServerTask", () => {
  it("should call the api with the task id", async () => {
    adminApiMock.cancelServerTask.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCancelServerTask(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync("task-id-1");
    });

    expect(adminApiMock.cancelServerTask).toHaveBeenCalledWith("task-id-1");
  });
});

describe("useSetServerMaintenance", () => {
  it("should call the api and invalidate server state + site status", async () => {
    adminApiMock.setServerMaintenance.mockResolvedValueOnce(undefined);
    adminApiMock.getServerState.mockResolvedValueOnce(sampleState);
    adminApiMock.getSiteStatus.mockResolvedValueOnce({
      success: true,
      maintenance: true,
      message: null,
    });

    const { result } = renderHook(
      () => {
        const setMaint = useSetServerMaintenance();
        const state = useServerState();
        const status = useSiteStatus();
        return { setMaint, state, status };
      },
      { wrapper: Wrapper },
    );

    await vi.waitFor(() => {
      expect(result.current.state.isSuccess).toBe(true);
      expect(result.current.status.isSuccess).toBe(true);
    });

    const stateCallsBefore = adminApiMock.getServerState.mock.calls.length;
    const statusCallsBefore = adminApiMock.getSiteStatus.mock.calls.length;

    await act(async () => {
      await result.current.setMaint.mutateAsync({ enabled: true, message: "maintenance" });
    });

    expect(adminApiMock.setServerMaintenance).toHaveBeenCalledWith(true, "maintenance");
    await vi.waitFor(() => {
      expect(adminApiMock.getServerState.mock.calls.length).toBeGreaterThan(stateCallsBefore);
      expect(adminApiMock.getSiteStatus.mock.calls.length).toBeGreaterThan(statusCallsBefore);
    });
  });
});

describe("useRestartServer", () => {
  it("should call the restart api", async () => {
    adminApiMock.restartServer.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useRestartServer(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(adminApiMock.restartServer).toHaveBeenCalled();
  });
});