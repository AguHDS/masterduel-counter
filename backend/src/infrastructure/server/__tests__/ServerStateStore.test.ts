import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { ServerStateStore as ServerStateStoreType } from "@/infrastructure/server/ServerStateStore.js";
import type { ServerTask } from "@/domain/ServerManagement.js";

describe("ServerStateStore", () => {
  let tempDir: string;
  let ServerStateStore: typeof ServerStateStoreType;

  beforeAll(async () => {
    tempDir = mkdtempSync(join(tmpdir(), "mdc-state-"));
    process.env.SERVER_STATE_DIR = tempDir;
    ({ ServerStateStore } = await import(
      "@/infrastructure/server/ServerStateStore.js"
    ));
  });

  afterAll(() => {
    delete process.env.SERVER_STATE_DIR;
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("should start with a clean default state", () => {
    const store = new ServerStateStore();
    expect(store.getState()).toEqual({
      maintenance: { enabled: false, message: null, auto: false },
      task: null,
      lastTask: null,
    });
  });

  it("should persist maintenance state and reload it from disk", () => {
    const store = new ServerStateStore();
    store.setMaintenance(true, "testing maintenance", true);

    // A brand new instance reads the persisted file
    const reloaded = new ServerStateStore();
    expect(reloaded.getState().maintenance).toEqual({
      enabled: true,
      message: "testing maintenance",
      auto: true,
    });
  });

  it("should persist task and lastTask and reload them from disk", () => {
    const task: ServerTask = {
      id: "task-1",
      type: "download-cards",
      status: "running",
      startedAt: "2026-08-25T00:00:00.000Z",
      finishedAt: null,
      pid: 1234,
      logFile: join(tempDir, "task-logs", "task-1.log"),
      exitCode: null,
    };
    const store = new ServerStateStore();
    store.setTask(task);
    store.setLastTask({ ...task, status: "done", finishedAt: "2026-08-25T01:00:00.000Z", exitCode: 0 });

    const reloaded = new ServerStateStore();
    expect(reloaded.getState().task).toEqual(task);
    expect(reloaded.getState().lastTask?.status).toBe("done");
  });

  it("should fall back to defaults when the state file is corrupt", () => {
    const stateFile = join(tempDir, "server-state.json");
    writeFileSync(stateFile, "{ not valid json", "utf8");

    const store = new ServerStateStore();
    expect(store.getState()).toEqual({
      maintenance: { enabled: false, message: null, auto: false },
      task: null,
      lastTask: null,
    });

    // Clean up so other tests are not affected
    writeFileSync(stateFile, JSON.stringify({ maintenance: { enabled: false, message: null, auto: false }, task: null, lastTask: null }), "utf8");
  });

  it("should create the data and logs directories", () => {
    new ServerStateStore();
    expect(existsSync(join(tempDir, "task-logs"))).toBe(true);
    expect(existsSync(join(tempDir, "server-state.json"))).toBe(true);
    // sanity: the persisted file is valid JSON
    expect(() => JSON.parse(readFileSync(join(tempDir, "server-state.json"), "utf8"))).not.toThrow();
  });
});