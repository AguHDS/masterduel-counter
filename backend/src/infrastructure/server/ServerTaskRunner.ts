import { ChildProcess, spawn } from "child_process";
import { closeSync, existsSync, openSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  ServerTaskOptions,
  ServerTaskType,
} from "@/domain/ServerManagement.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// src/infrastructure/server -> ../../../ -> backend root
const ROOT_DIR = join(__dirname, "../../../");

interface TaskDefinition {
  source: string;
  args: (opts: ServerTaskOptions) => string[];
}

/** Allowlist of runnable scripts. Never interpolate user input into commands */
const TASKS: Record<ServerTaskType, TaskDefinition> = {
  "download-cards": {
    source: "download-all-cards",
    args: (opts) => {
      const args: string[] = [];
      if (opts.delay !== undefined && !isNaN(opts.delay) && opts.delay >= 0) {
        args.push("--delay", String(Math.floor(opts.delay)));
      }
      if (opts.limit !== undefined && !isNaN(opts.limit) && opts.limit > 0) {
        args.push("--limit", String(Math.floor(opts.limit)));
      }
      return args;
    },
  },
  "populate-archetypes": { source: "populate-archetypes", args: () => [] },
  "generate-thumbnails": { source: "generate-thumbnails", args: () => [] },
  "update-card-details": { source: "update-card-details", args: () => [] },
  "migrate-card-images": { source: "migrate-card-images", args: () => [] },
};

export interface SpawnedTask {
  id: string;
  child: ChildProcess;
  logFile: string;
}

/** Spawns maintenance scripts as detached child processes with output piped to a log file */
export class ServerTaskRunner {
  isKnownTask(type: string): type is ServerTaskType {
    return type in TASKS;
  }

  spawnTask(
    type: ServerTaskType,
    id: string,
    opts: ServerTaskOptions,
    logsDir: string,
  ): SpawnedTask {
    const config = TASKS[type];
    const logFile = join(logsDir, `${id}.log`);
    // Numeric fd so the child's stdout/stderr go straight to the log file
    const logFd = openSync(logFile, "a");

    const isProd = process.env.NODE_ENV === "production";
    let command: string;
    let args: string[];

    if (isProd) {
      command = process.execPath;
      args = [
        join(ROOT_DIR, "dist", "scripts", `${config.source}.js`),
        ...config.args(opts),
      ];
    } else {
      // Development: run TS source via tsx loader (handles @/ path aliases)
      command = process.execPath;
      args = [
        "--import",
        "tsx",
        join(ROOT_DIR, "src", "scripts", `${config.source}.ts`),
        ...config.args(opts),
      ];
    }

    console.log(
      `[ServerTaskRunner] Spawning ${type} (${isProd ? "prod" : "dev"}): ${command} ${args.join(" ")}`,
    );

    const child = spawn(command, args, {
      cwd: ROOT_DIR,
      env: process.env,
      stdio: ["ignore", logFd, logFd],
      detached: true,
    });
    child.unref();
    child.once("exit", () => closeSync(logFd));

    return { id, child, logFile };
  }

  /** Checks whether a process with the given PID is currently alive */
  static isAlive(pid: number | null): boolean {
    if (!pid) return false;
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  /** Returns the last lines of a task log file */
  static tailLog(logFile: string, lines = 40): string[] {
    try {
      if (!existsSync(logFile)) return [];
      const content = readFileSync(logFile, "utf8");
      return content
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")
        .slice(-lines);
    } catch {
      return [];
    }
  }
}