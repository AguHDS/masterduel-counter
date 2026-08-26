import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServerManagementTab } from "../ServerManagementTab";
import type { ServerStateResponse, ServerTask } from "../../types/adminPanelTypes";

const hooksMock = vi.hoisted(() => ({
  useServerState: vi.fn(),
  useStartServerTask: vi.fn(),
  useCancelServerTask: vi.fn(),
  useSetServerMaintenance: vi.fn(),
  useRestartServer: vi.fn(),
}));

vi.mock("../../hooks/useServerManagement", () => hooksMock);

const idleState: ServerStateResponse = {
  success: true,
  maintenance: { enabled: false, message: null, auto: false },
  task: null,
  lastTask: null,
  logTail: [],
};

const runningTask: ServerTask = {
  id: "task-abc",
  type: "download-cards",
  status: "running",
  startedAt: new Date().toISOString(),
  finishedAt: null,
  pid: 999,
  logFile: "/tmp/task-abc.log",
  exitCode: null,
};

const runningState: ServerStateResponse = {
  ...idleState,
  task: runningTask,
  logTail: ["Downloading: 123 (50%)", "Downloaded: 123"],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let startMutate: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cancelMutate: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let setMaintMutate: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let restartMutate: any;

function renderTab(state: ServerStateResponse = idleState) {
  hooksMock.useServerState.mockReturnValue({ data: state });
  hooksMock.useStartServerTask.mockReturnValue({ mutate: startMutate, isPending: false });
  hooksMock.useCancelServerTask.mockReturnValue({ mutate: cancelMutate, isPending: false });
  hooksMock.useSetServerMaintenance.mockReturnValue({ mutate: setMaintMutate, isPending: false });
  hooksMock.useRestartServer.mockReturnValue({
    mutate: restartMutate,
    isPending: false,
    isError: false,
    error: null,
  });

  return render(<ServerManagementTab />);
}

beforeEach(() => {
  vi.clearAllMocks();
  startMutate = vi.fn();
  cancelMutate = vi.fn();
  setMaintMutate = vi.fn();
  restartMutate = vi.fn();
});

describe("ServerManagementTab", () => {
  it("should render all five maintenance tasks", () => {
    renderTab();

    expect(screen.getByText("Download Card Images")).toBeDefined();
    expect(screen.getByText("Populate Archetypes")).toBeDefined();
    expect(screen.getByText("Generate Thumbnails")).toBeDefined();
    expect(screen.getByText("Update Card Details")).toBeDefined();
    expect(screen.getByText("Migrate Card Images")).toBeDefined();
  });

  it("should start a simple task with no options", async () => {
    const user = userEvent.setup();
    renderTab();

    // TASKS order: download-cards(0), populate-archetypes(1), ...
    await user.click(screen.getAllByText("Run Task")[1]);

    expect(startMutate).toHaveBeenCalledWith({
      type: "populate-archetypes",
      options: undefined,
    });
  });

  it("should start download-cards with the configured delay", async () => {
    const user = userEvent.setup();
    renderTab();

    await user.click(screen.getAllByText("Run Task")[0]);

    expect(startMutate).toHaveBeenCalledWith({
      type: "download-cards",
      options: { delay: 250, limit: undefined },
    });
  });

  it("should show the running task with log tail and allow cancelling", async () => {
    const user = userEvent.setup();
    renderTab(runningState);

    expect(screen.getByText("Running Task")).toBeDefined();
    expect(screen.getByText(/Downloading: 123 \(50%\)/)).toBeDefined();
    expect(screen.getByText(/Downloaded: 123/)).toBeDefined();

    await user.click(screen.getByText("Cancel Task"));
    expect(cancelMutate).toHaveBeenCalledWith("task-abc");
  });

  it("should toggle maintenance mode", async () => {
    const user = userEvent.setup();
    renderTab();

    await user.click(screen.getByRole("checkbox"));

    expect(setMaintMutate).toHaveBeenCalledWith({ enabled: true, message: null });
  });

  it("should restart the server after confirmation", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    renderTab();

    await user.click(screen.getByText("Restart Server"));
    expect(confirmSpy).toHaveBeenCalled();
    expect(restartMutate).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});