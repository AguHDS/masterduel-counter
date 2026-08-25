import {
  ServerState,
  ServerTask,
  ServerTaskOptions,
  ServerTaskType,
} from "@/domain/ServerManagement.js";


export interface ServerManagementApplicationPort {
  /** Public lightweight status (maintenance flag) used by the frontend gate */
  getPublicStatus(): { maintenance: boolean; message: string | null };
  /** Admin: full operational state + tail of the running task log. Get the state of the current task */
  getState(): ServerState & { logTail: string[] };
  /** Admin: start a maintenance script as a detached child process */
  startTask(
    type: ServerTaskType,
    options?: ServerTaskOptions,
  ): Promise<{ task: ServerTask }>;
  /** Admin: stop the running task */
  cancelTask(id: string): Promise<{ success: boolean; message: string }>;
  /** Admin: manually toggle maintenance mode */
  setMaintenance(
    enabled: boolean,
    message?: string | null,
  ): Promise<{ success: boolean; message: string }>;
  /** Admin: restart the backend process (pm2, production only) */
  restartServer(): Promise<{ success: boolean; message: string }>;
}