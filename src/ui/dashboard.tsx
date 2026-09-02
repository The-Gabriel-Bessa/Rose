import React from "react";
import { Box, Text } from "ink";
import { StatusBar } from "./status-bar.js";
import { StatsPanel } from "./stats-panel.js";
import { LogViewer } from "./log-viewer.js";
import { RecoveryPanel } from "./recovery-panel.js";
import { TaskList } from "./task-list.js";
import type { RoseState } from "../types/state.js";
import type { ProjectState } from "../types/project.js";
import type { AgentHealthCheck, RecoveryCheckpoint } from "../diagnostics/recovery-types.js";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

interface DashboardProps {
  state: RoseState;
  projectState: ProjectState;
  logs: LogEntry[];
  health?: AgentHealthCheck;
  checkpoints: RecoveryCheckpoint[];
  recoveryCount: number;
}

export function Dashboard({
  state,
  projectState,
  logs,
  health,
  checkpoints,
  recoveryCount,
}: DashboardProps) {
  const uptime = calculateUptime(projectState.startedAt);

  return (
    <Box flexDirection="column" padding={1}>
      <StatusBar
        state={state}
        projectName={projectState.projectName}
        iteration={projectState.currentIteration}
        uptime={uptime}
      />

      <Box flexDirection="row" marginBottom={1}>
        <Box width="60%">
          <StatsPanel
            requirements={{
              total: projectState.requirements.length,
              validated: projectState.requirements.filter((r) => r.status === "VALIDATED").length,
            }}
            tests={{
              total: projectState.tests.length,
              passed: projectState.tests.filter((t) => t.status === "PASS").length,
              failed: projectState.tests.filter((t) => t.status === "FAIL").length,
              notRun: projectState.tests.filter((t) => t.status === "NOT_RUN").length,
            }}
            bugs={{
              total: projectState.bugs.length,
              open: projectState.bugs.filter((b) => b.status === "OPEN").length,
              fixed: projectState.bugs.filter((b) => b.status === "FIXED" || b.status === "VERIFIED").length,
            }}
            tasks={projectState.tasks}
          />
        </Box>

        <Box width="40%" paddingLeft={1}>
          <RecoveryPanel
            health={health}
            checkpoints={checkpoints}
            recoveryCount={recoveryCount}
          />
        </Box>
      </Box>

      <Box flexDirection="row">
        <Box width="50%">
          <TaskList tasks={projectState.tasks} />
        </Box>

        <Box width="50%" paddingLeft={1}>
          <LogViewer logs={logs} />
        </Box>
      </Box>
    </Box>
  );
}

function calculateUptime(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const diff = now - start;

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
