export type ServerTaskType =
  | "download-cards"
  | "populate-archetypes"
  | "generate-thumbnails"
  | "update-card-details"
  | "migrate-card-images";

export type ServerTaskStatus = "running" | "done" | "failed" | "cancelled";

export interface ServerTask {
  id: string;
  type: ServerTaskType;
  status: ServerTaskStatus;
  startedAt: string;
  finishedAt: string | null;
  pid: number | null;
  logFile: string;
  exitCode: number | null;
}

export interface ServerMaintenanceState {
  enabled: boolean;
  message: string | null;
  /** Whether maintenance was auto-enabled by a running task (so it auto-clears on finish) */
  auto: boolean;
}

export interface ServerState {
  maintenance: ServerMaintenanceState;
  task: ServerTask | null;
  lastTask: ServerTask | null;
}

export interface ServerTaskOptions {
  delay?: number;
  limit?: number;
}