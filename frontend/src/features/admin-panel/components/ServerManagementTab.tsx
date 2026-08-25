import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Download,
  Database,
  Images,
  RefreshCw,
  HardDrive,
  Power,
  CheckCircle2,
  XCircle,
  Loader2,
  Wrench,
  Info,
  StopCircle,
} from "lucide-react";
import {
  useServerState,
  useStartServerTask,
  useCancelServerTask,
  useSetServerMaintenance,
  useRestartServer,
} from "../hooks/useServerManagement";
import type {
  ServerTask,
  ServerTaskType,
} from "../types/adminPanelTypes";

interface TaskInfo {
  type: ServerTaskType;
  label: string;
  description: string;
  estimated: string;
  heavy: boolean;
}

const TASKS: TaskInfo[] = [
  {
    type: "download-cards",
    label: "Download Card Images",
    description:
      "Downloads all ~14,000 card images (normal, small, cropped) of ygoprodeck API to storage. Resumable: skips already-downloaded cards.",
    estimated: "~3-4h en el VPS (con --delay 250).",
    heavy: true,
  },
  {
    type: "populate-archetypes",
    label: "Populate Archetypes",
    description:
      "Fetches archetype names from YGOProDeck and inserts the new ones into the database.",
    estimated: "Segundos.",
    heavy: false,
  },
  {
    type: "generate-thumbnails",
    label: "Generate Thumbnails",
    description:
      "Pre-generates the 100x100 thumbnail cache for all cropped card images. On-demand generation still works without this.",
    estimated: "~10-20 min.",
    heavy: true,
  },
  {
    type: "update-card-details",
    label: "Update Card Details",
    description:
      "Fetches missing details (type, desc, race, atk, def, etc.) for cards already in the database.",
    estimated: "Largo (una llamada por carta).",
    heavy: true,
  },
  {
    type: "migrate-card-images",
    label: "Migrate Card Images",
    description:
      "Downloads images for DB cards that still hotlink to YGOProDeck and switches them to local storage URLs.",
    estimated: "Variable según cuántas cartas queden por migrar.",
    heavy: true,
  },
];

const STATUS_ICON: Record<ServerTask["status"], ReactNode> = {
  running: <Loader2 className="w-4 h-4 animate-spin text-blue-400" />,
  done: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
  cancelled: <StopCircle className="w-4 h-4 text-amber-400" />,
};

function formatElapsed(startedAt: string): string {
  const diff = Date.now() - new Date(startedAt).getTime();
  const s = Math.max(0, Math.floor(diff / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/** Tab for managing the server: maintenance tasks + restart, in the Admin Panel */
export const ServerManagementTab = () => {
  const { data: state } = useServerState();
  const startTask = useStartServerTask();
  const cancelTask = useCancelServerTask();
  const setMaintenance = useSetServerMaintenance();
  const restart = useRestartServer();

  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [downloadDelay, setDownloadDelay] = useState("250");
  const [downloadLimit, setDownloadLimit] = useState("");

  const runningTask = state?.task ?? null;
  const maintenance = state?.maintenance;
  const taskRunning = runningTask?.status === "running";

  const handleRun = (info: TaskInfo) => {
    if (taskRunning) return;
    const options =
      info.type === "download-cards"
        ? {
          delay: parseInt(downloadDelay, 10) || undefined,
          limit: parseInt(downloadLimit, 10) || undefined,
        }
        : undefined;
    startTask.mutate({ type: info.type, options });
  };

  const handleMaintenance = (enabled: boolean) => {
    if (enabled && !maintenanceMessage.trim()) {
      setMaintenanceMessage("Server maintenance: we'll be right back.");
    }
    setMaintenance.mutate({
      enabled,
      message: enabled ? maintenanceMessage.trim() || null : null,
    });
  };

  const handleRestart = () => {
    if (
      window.confirm(
        "Restart the backend server? This will briefly take the site down. (Only available in production)",
      )
    ) {
      restart.mutate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-sky-500/10 border border-sky-500/30 rounded-lg">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <p className="text-sm text-sky-200">
          These buttons run the maintenance scripts directly on the server, they 
          execute on the VPS, not your local machine. Heavy tasks put the site into maintenance mode automatically and it turns off when 
          they finish. You can monitor progress here and cancel a running task.
        </p>
      </div>

      {/* Maintenance mode */}
      <section className="border border-slate-600/30 rounded-xl bg-slate-900/40 p-5">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          Maintenance Mode
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Shows a "We're doing some improvements, come back soon" screen to
          regular users. Admins can still access the site. Enabled automatically
          by heavy tasks.
        </p>

        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={maintenance?.enabled ?? false}
              onChange={(e) => handleMaintenance(e.target.checked)}
              className="w-4 h-4 rounded border-slate-500 bg-slate-800 accent-amber-500"
            />
            <span className="text-slate-200 text-sm font-semibold">
              {maintenance?.enabled ? "Maintenance active" : "Maintenance off"}
            </span>
          </label>
          <input
            type="text"
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="Optional message shown in the maintenance screen"
            className="flex-1 min-w-0 bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500/70"
          />
        </div>
      </section>

      {/* Running task */}
      {runningTask && (
        <section className="border border-blue-500/40 rounded-xl bg-blue-950/30 p-5">
          <h2 className="text-lg font-bold text-blue-200 flex items-center gap-2">
            <RefreshCw
              className={`w-5 h-5 text-blue-400 ${taskRunning ? "animate-spin" : ""}`}
            />
            Running Task
          </h2>
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-200 border border-blue-500/40 rounded text-xs font-bold uppercase tracking-wider">
                {TASKS.find((t) => t.type === runningTask.type)?.label ?? runningTask.type}
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                {STATUS_ICON[runningTask.status]}
                {runningTask.status}
              </span>
              <span className="text-slate-400">
                Started: {new Date(runningTask.startedAt).toLocaleString()}
              </span>
              {taskRunning && (
                <span className="text-slate-400">
                  Elapsed: {formatElapsed(runningTask.startedAt)}
                </span>
              )}
            </div>

            <div className="bg-black/50 border border-slate-700/50 rounded-lg p-3 max-h-64 overflow-auto">
              <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap break-words">
                {state?.logTail?.length
                  ? state.logTail.join("\n")
                  : "Waiting for task output..."}
              </pre>
            </div>

            {taskRunning && (
              <button
                onClick={() => cancelTask.mutate(runningTask.id)}
                disabled={cancelTask.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                {cancelTask.isPending ? "Cancelling..." : "Cancel Task"}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Last task */}
      {state?.lastTask && !runningTask && (
        <section className="border border-slate-600/30 rounded-xl bg-slate-900/40 p-5">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {STATUS_ICON[state.lastTask.status]}
            Last Task
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            <span className="font-semibold text-slate-200">
              {TASKS.find((t) => t.type === state.lastTask!.type)?.label ?? state.lastTask.type}
            </span>{" "}
            finished as{" "}
            <span className="font-semibold">{state.lastTask.status}</span> at{" "}
            {new Date(state.lastTask.finishedAt!).toLocaleString()}
            {state.lastTask.exitCode !== null &&
              ` (exit code ${state.lastTask.exitCode})`}.
          </p>
        </section>
      )}

      {/* Tasks */}
      <section>
        <h2 className="text-lg font-bold text-slate-100 mb-3">Maintenance Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TASKS.map((info) => {
            const Icon = TASK_ICONS[info.type];
            return (
              <div
                key={info.type}
                className="border border-slate-600/30 rounded-xl bg-slate-900/40 p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">{info.label}</h3>
                    <p className="text-xs text-slate-500">{info.estimated}</p>
                  </div>
                  {info.heavy && (
                    <span className="ml-auto px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold uppercase tracking-wider">
                      Maintenance
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-400">{info.description}</p>

                {info.type === "download-cards" && (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      Delay (ms)
                      <input
                        type="number"
                        min={0}
                        value={downloadDelay}
                        onChange={(e) => setDownloadDelay(e.target.value)}
                        className="w-20 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-amber-500/70"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      Limit (opcional)
                      <input
                        type="number"
                        min={0}
                        value={downloadLimit}
                        onChange={(e) => setDownloadLimit(e.target.value)}
                        placeholder="all"
                        className="w-20 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-amber-500/70"
                      />
                    </label>
                  </div>
                )}

                <button
                  onClick={() => handleRun(info)}
                  disabled={taskRunning || startTask.isPending}
                  className="mt-auto flex items-center justify-center gap-2 px-4 py-2 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {startTask.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlayIcon />
                  )}
                  {taskRunning ? "A task is already running" : "Run Task"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Server restart */}
      <section className="border border-red-500/30 rounded-xl bg-red-950/20 p-5">
        <h2 className="text-lg font-bold text-red-200 flex items-center gap-2">
          <Power className="w-5 h-5 text-red-400" />
          Server
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Restarts the backend process via pm2 (production only). The site is
          briefly unavailable while it comes back up.
        </p>
        <button
          onClick={handleRestart}
          disabled={restart.isPending}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
        >
          <Power className="w-4 h-4" />
          {restart.isPending ? "Restarting..." : "Restart Server"}
        </button>
        {restart.isError && (
          <p className="text-red-400 text-sm mt-2">
            {(restart.error as Error)?.message || "Failed to restart server"}
          </p>
        )}
      </section>
    </div>
  );
};

const TASK_ICONS: Record<ServerTaskType, ComponentType<{ className?: string }>> = {
  "download-cards": Download,
  "populate-archetypes": Database,
  "generate-thumbnails": Images,
  "update-card-details": HardDrive,
  "migrate-card-images": RefreshCw,
};

function PlayIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}