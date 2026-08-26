import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { EventEmitter } from "events";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { ServerManagementApplicationService as SvcType } from "@/application/services/ServerManagementApplicationService.js";
import type { ServerStateStore as StoreType } from "@/infrastructure/server/ServerStateStore.js";
import type { ServerTask } from "@/domain/ServerManagement.js";

vi.mock("@/infrastructure/server/ServerTaskRunner.js", () => {
  class MockRunner {
    static tailLog = vi.fn(() => []);
    static isAlive = vi.fn(() => true);
    isKnownTask = vi.fn(() => true);
    spawnTask = vi.fn();
  }
  return { ServerTaskRunner: MockRunner };
});

describe("ServerManagementApplicationService", () => {
  let tempDir: string;
  let ServerManagementApplicationService: typeof SvcType;
  let ServerStateStore: typeof StoreType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ServerTaskRunner: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let store: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let runner: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let svc: any;

  function makeFakeChild(pid = 4242) {
    const child = new EventEmitter() as EventEmitter & { pid: number };
    (child as { pid: number }).pid = pid;
    return child;
  }

  beforeAll(async () => {
    tempDir = mkdtempSync(join(tmpdir(), "mdc-svc-"));
    process.env.SERVER_STATE_DIR = tempDir;
    ({ ServerStateStore } = await import(
      "@/infrastructure/server/ServerStateStore.js"
    ));
    ({ ServerTaskRunner } = await import(
      "@/infrastructure/server/ServerTaskRunner.js"
    ));
    ({ ServerManagementApplicationService } = await import(
      "@/application/services/ServerManagementApplicationService.js"
    ));
  });

  afterAll(() => {
    delete process.env.SERVER_STATE_DIR;
    rmSync(tempDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    store = new ServerStateStore();
    store.setMaintenance(false, null, false);
    store.setTask(null);
    store.setLastTask(null);
    runner = new ServerTaskRunner();
    svc = new ServerManagementApplicationService(store, runner);
    vi.clearAllMocks();
  });

  describe("getPublicStatus", () => {
    it("should return maintenance false when off", () => {
      expect(svc.getPublicStatus()).toEqual({ maintenance: false, message: null });
    });

    it("should return maintenance true + message when on", () => {
      store.setMaintenance(true, "down", false);
      expect(svc.getPublicStatus()).toEqual({ maintenance: true, message: "down" });
    });
  });

  describe("startTask", () => {
    it("should start a heavy task and auto-enable maintenance", async () => {
      const fakeChild = makeFakeChild();
      runner.spawnTask.mockReturnValue({ id: "t1", child: fakeChild, logFile: join(tempDir, "t1.log") });

      const { task } = await svc.startTask("download-cards");

      expect(task.status).toBe("running");
      expect(store.getState().task?.status).toBe("running");
      expect(store.getState().maintenance).toEqual({
        enabled: true,
        message: expect.any(String),
        auto: true,
      });
    });

    it("should NOT enable maintenance for a non-heavy task", async () => {
      const fakeChild = makeFakeChild();
      runner.spawnTask.mockReturnValue({ id: "t2", child: fakeChild, logFile: join(tempDir, "t2.log") });

      await svc.startTask("populate-archetypes");

      expect(store.getState().task?.type).toBe("populate-archetypes");
      expect(store.getState().maintenance.enabled).toBe(false);
    });

    it("should throw for an unknown task type", async () => {
      runner.isKnownTask.mockReturnValue(false);
      await expect(svc.startTask("populate-archetypes")).rejects.toThrow(
        "Unknown task type",
      );
    });

    it("should throw when a task is already running", async () => {
      const running: ServerTask = {
        id: "existing",
        type: "generate-thumbnails",
        status: "running",
        startedAt: new Date().toISOString(),
        finishedAt: null,
        pid: 999,
        logFile: "x.log",
        exitCode: null,
      };
      store.setTask(running);
      await expect(svc.startTask("populate-archetypes")).rejects.toThrow(
        "A task is already running",
      );
    });

    it("should mark done + clear auto maintenance when the child exits with code 0", async () => {
      const fakeChild = makeFakeChild();
      runner.spawnTask.mockReturnValue({ id: "t3", child: fakeChild, logFile: join(tempDir, "t3.log") });
      await svc.startTask("download-cards");
      expect(store.getState().maintenance.enabled).toBe(true);

      fakeChild.emit("exit", 0, null);

      expect(store.getState().task).toBeNull();
      expect(store.getState().lastTask?.status).toBe("done");
      expect(store.getState().lastTask?.exitCode).toBe(0);
      expect(store.getState().maintenance.enabled).toBe(false);
    });

    it("should mark cancelled when the child exits via SIGTERM", async () => {
      const fakeChild = makeFakeChild();
      runner.spawnTask.mockReturnValue({ id: "t4", child: fakeChild, logFile: join(tempDir, "t4.log") });
      await svc.startTask("download-cards");

      fakeChild.emit("exit", null, "SIGTERM");

      expect(store.getState().lastTask?.status).toBe("cancelled");
      expect(store.getState().maintenance.enabled).toBe(false);
    });

    it("should NOT clear maintenance that was set manually while the task ran", async () => {
      const fakeChild = makeFakeChild();
      runner.spawnTask.mockReturnValue({ id: "t5", child: fakeChild, logFile: join(tempDir, "t5.log") });
      await svc.startTask("download-cards");
      // admin manually toggles maintenance (auto=false)
      svc.setMaintenance(true, "manual maintenance");

      fakeChild.emit("exit", 0, null);

      expect(store.getState().maintenance.enabled).toBe(true);
      expect(store.getState().maintenance.auto).toBe(false);
    });
  });

  describe("cancelTask", () => {
    it("should return failure for an unknown/not-running id", async () => {
      const result = await svc.cancelTask("whatever");
      expect(result.success).toBe(false);
    });

    it("should kill the child process for the running task", async () => {
      const fakeChild = makeFakeChild(777);
      runner.spawnTask.mockReturnValue({ id: "c1", child: fakeChild, logFile: join(tempDir, "c1.log") });
      const { task } = await svc.startTask("populate-archetypes");

      const killSpy = vi.spyOn(process, "kill").mockImplementation(() => true);
      const result = await svc.cancelTask(task.id);

      expect(killSpy).toHaveBeenCalledWith(777, "SIGTERM");
      expect(result.success).toBe(true);
      killSpy.mockRestore();
    });
  });

  describe("restartServer", () => {
    it("should refuse to restart outside production", async () => {
      // NODE_ENV is "test" under vitest
      const result = await svc.restartServer();
      expect(result.success).toBe(false);
      expect(result.message).toContain("only available in production");
    });
  });

  describe("reconcile", () => {
    it("should mark a running task as failed when its PID is dead", async () => {
      const running: ServerTask = {
        id: "r1",
        type: "update-card-details",
        status: "running",
        startedAt: new Date().toISOString(),
        finishedAt: null,
        pid: 123,
        logFile: join(tempDir, "r1.log"),
        exitCode: null,
      };
      store.setMaintenance(true, "auto", true);
      store.setTask(running);
      ServerTaskRunner.isAlive.mockReturnValue(false);

      const state = svc.getState();

      expect(state.task).toBeNull();
      expect(state.lastTask?.status).toBe("failed");
      expect(state.maintenance.enabled).toBe(false);
    });

    it("should keep a running task when its PID is still alive", async () => {
      const running: ServerTask = {
        id: "r2",
        type: "populate-archetypes",
        status: "running",
        startedAt: new Date().toISOString(),
        finishedAt: null,
        pid: 456,
        logFile: join(tempDir, "r2.log"),
        exitCode: null,
      };
      store.setTask(running);
      ServerTaskRunner.isAlive.mockReturnValue(true);
      ServerTaskRunner.tailLog.mockReturnValue(["progress 50%"]);

      const state = svc.getState();

      expect(state.task?.status).toBe("running");
      expect(state.logTail).toEqual(["progress 50%"]);
    });
  });
});