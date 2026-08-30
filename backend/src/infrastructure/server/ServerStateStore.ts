import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  ServerMaintenanceState,
  ServerState,
  ServerTask,
} from "@/domain/ServerManagement.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// src/infrastructure/server -> ../../../ -> backend root
// SERVER_STATE_DIR overrides the location (used by tests to avoid touching backend/data)
const DATA_DIR =
  process.env.SERVER_STATE_DIR || join(__dirname, "../../../data");
const STATE_FILE = join(DATA_DIR, "server-state.json");
const LOGS_DIR = join(DATA_DIR, "task-logs");

const DEFAULT_STATE: ServerState = {
  maintenance: { enabled: false, message: null, auto: false },
  task: null,
  lastTask: null,
};

/**
 * Persists server-management operational state (maintenance flag + active task)
 * in a JSON file so it survives backend restarts. In-memory mirror avoids disk I/O on every public status check
 */
export class ServerStateStore {
  private state: ServerState;

  constructor() {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!existsSync(LOGS_DIR)) {
      mkdirSync(LOGS_DIR, { recursive: true });
    }
    this.state = this.load();
  }

  getState(): ServerState {
    return this.state;
  }

  setTask(task: ServerTask | null): void {
    this.state.task = task;
    this.persist();
  }

  setLastTask(task: ServerTask | null): void {
    this.state.lastTask = task;
    this.persist();
  }

  setMaintenance(enabled: boolean, message: string | null, auto: boolean): void {
    this.state.maintenance = { enabled, message, auto };
    this.persist();
  }

  getLogsDir(): string {
    return LOGS_DIR;
  }

  /** Loads the persisted server state from disk, falling back to the default
    * state if the file is missing or cannot be read */
  private load(): ServerState {
    try {
      if (existsSync(STATE_FILE)) {
        const parsed = JSON.parse(readFileSync(STATE_FILE, "utf8")) as ServerState;
        const maintenance: ServerMaintenanceState = {
          ...DEFAULT_STATE.maintenance,
          ...(parsed.maintenance ?? {}),
        };
        return {
          maintenance,
          task: parsed.task ?? null,
          lastTask: parsed.lastTask ?? null,
        };
      }
    } catch (error) {
      console.error("[ServerStateStore] Failed to load state file, using defaults:", error);
    }
    return structuredClone(DEFAULT_STATE);
  }

  private persist(): void {
    try {
      writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), "utf8");
    } catch (error) {
      console.error("[ServerStateStore] Failed to persist state:", error);
    }
  }
}