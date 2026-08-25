import { spawn, ChildProcess } from "child_process";
import { randomUUID } from "crypto";
import { ServerManagementApplicationPort } from "@/application/ports/ServerManagementApplicationPort.js";
import {
  ServerTask,
  ServerTaskOptions,
  ServerTaskType,
} from "@/domain/ServerManagement.js";
import { ServerStateStore } from "@/infrastructure/server/ServerStateStore.js";
import { ServerTaskRunner } from "@/infrastructure/server/ServerTaskRunner.js";

/** Tasks that take a long time -> auto-enable maintenance mode while they run */
const HEAVY_TASKS: ServerTaskType[] = [
  "download-cards",
  "generate-thumbnails",
  "update-card-details",
  "migrate-card-images",
];

const PM2_APP_NAME = process.env.PM2_APP_NAME || "masterduel-backend";

export class ServerManagementApplicationService implements ServerManagementApplicationPort {
  private currentChild: ChildProcess | null = null;
  private currentId: string | null = null;

  constructor(
    private readonly store: ServerStateStore,
    private readonly runner: ServerTaskRunner,
  ) {}

  getPublicStatus(): { maintenance: boolean; message: string | null } {
    const { maintenance } = this.store.getState();
    return {
      maintenance: maintenance.enabled,
      message: maintenance.message,
    };
  }

  getState(): ReturnType<ServerManagementApplicationPort["getState"]> {
    this.reconcile();
    const state = this.store.getState();
    const logTail = state.task ? ServerTaskRunner.tailLog(state.task.logFile) : [];
    return { ...state, logTail };
  }

  startTask(
    type: ServerTaskType,
    options: ServerTaskOptions = {},
  ): Promise<{ task: ServerTask }> {
    this.reconcile();

    const state = this.store.getState();
    if (state.task && state.task.status === "running") {
      throw new Error("A task is already running");
    }
    if (!this.runner.isKnownTask(type)) {
      throw new Error("Unknown task type");
    }

    const id = randomUUID();
    const delay = this.resolveDelay(type, options.delay);

    const spawned = this.runner.spawnTask(
      type,
      id,
      { ...options, delay },
      this.store.getLogsDir(),
    );

    this.currentChild = spawned.child;
    this.currentId = id;

    const task: ServerTask = {
      id,
      type,
      status: "running",
      startedAt: new Date().toISOString(),
      finishedAt: null,
      pid: spawned.child.pid ?? null,
      logFile: spawned.logFile,
      exitCode: null,
    };
    this.store.setTask(task);

    if (HEAVY_TASKS.includes(type)) {
      this.store.setMaintenance(
        true,
        "Server maintenance: data update in progress, we'll be right back.",
        true,
      );
    }

    spawned.child.on("exit", (code, signal) => {
      const finished: ServerTask = {
        ...task,
        status:
          signal === "SIGTERM"
            ? "cancelled"
            : code === 0
              ? "done"
              : "failed",
        finishedAt: new Date().toISOString(),
        exitCode: code,
      };
      this.store.setTask(null);
      this.store.setLastTask(finished);
      this.currentChild = null;
      this.currentId = null;

      // Only auto-clear maintenance if it was auto-enabled by this task
      const { maintenance } = this.store.getState();
      if (maintenance.auto) {
        this.store.setMaintenance(false, null, false);
      }
    });

    return Promise.resolve({ task });
  }

  cancelTask(id: string): Promise<{ success: boolean; message: string }> {
    const state = this.store.getState();
    if (
      !state.task ||
      state.task.status !== "running" ||
      state.task.id !== id
    ) {
      return Promise.resolve({
        success: false,
        message: "No running task with that id",
      });
    }
    if (this.currentChild && this.currentChild.pid) {
      try {
        process.kill(this.currentChild.pid, "SIGTERM");
      } catch (error) {
        console.error("[ServerManagement] Failed to stop task:", error);
        return Promise.resolve({
          success: false,
          message: "Failed to stop the task process",
        });
      }
    }
    return Promise.resolve({
      success: true,
      message: "Task cancellation requested",
    });
  }

  setMaintenance(
    enabled: boolean,
    message?: string | null,
  ): Promise<{ success: boolean; message: string }> {
    // Manual toggle is never "auto" so a finishing task won't clear it
    this.store.setMaintenance(
      enabled,
      enabled ? (message ?? "Server maintenance") : null,
      false,
    );
    return Promise.resolve({
      success: true,
      message: enabled
        ? "Maintenance mode enabled"
        : "Maintenance mode disabled",
    });
  }

  restartServer(): Promise<{ success: boolean; message: string }> {
    if (process.env.NODE_ENV !== "production") {
      return Promise.resolve({
        success: false,
        message:
          "Restart is only available in production (pm2 is not running locally)",
      });
    }
    try {
      const child = spawn("pm2", ["restart", PM2_APP_NAME], {
        detached: true,
        stdio: "ignore",
      });
      child.unref();
      return Promise.resolve({ success: true, message: "Server restart triggered" });
    } catch (error) {
      console.error("[ServerManagement] Failed to trigger restart:", error);
      return Promise.resolve({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to trigger restart",
      });
    }
  }

  /** Marks orphaned running tasks as failed and clears auto-maintenance when the process is no longer alive */
  private reconcile(): void {
    const state = this.store.getState();
    if (
      state.task &&
      state.task.status === "running" &&
      !ServerTaskRunner.isAlive(state.task.pid)
    ) {
      const finished: ServerTask = {
        ...state.task,
        status: "failed",
        finishedAt: new Date().toISOString(),
        exitCode: null,
      };
      this.store.setTask(null);
      this.store.setLastTask(finished);
      const { maintenance } = this.store.getState();
      if (maintenance.auto) {
        this.store.setMaintenance(false, null, false);
      }
    }
  }

  /** Resolves the execution delay using the provided value or environment-specific defaults */
  private resolveDelay(type: ServerTaskType, delay?: number): number {
    if (delay !== undefined && !isNaN(delay) && delay >= 0) {
      return Math.floor(delay);
    }
    if (type === "download-cards") {
      return process.env.NODE_ENV === "production" ? 250 : 0;
    }
    return 0;
  }
}