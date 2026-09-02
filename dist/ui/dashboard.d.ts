import React from "react";
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
export declare function Dashboard({ state, projectState, logs, health, checkpoints, recoveryCount, }: DashboardProps): React.JSX.Element;
export {};
//# sourceMappingURL=dashboard.d.ts.map