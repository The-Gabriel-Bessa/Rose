import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from "ink";
import { StatusBar } from "./status-bar.js";
import { StatsPanel } from "./stats-panel.js";
import { LogViewer } from "./log-viewer.js";
import { RecoveryPanel } from "./recovery-panel.js";
import { TaskList } from "./task-list.js";
export function Dashboard({ state, projectState, logs, health, checkpoints, recoveryCount, }) {
    const uptime = calculateUptime(projectState.startedAt);
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(StatusBar, { state: state, projectName: projectState.projectName, iteration: projectState.currentIteration, uptime: uptime }), _jsxs(Box, { flexDirection: "row", marginBottom: 1, children: [_jsx(Box, { width: "60%", children: _jsx(StatsPanel, { requirements: {
                                total: projectState.requirements.length,
                                validated: projectState.requirements.filter((r) => r.status === "VALIDATED").length,
                            }, tests: {
                                total: projectState.tests.length,
                                passed: projectState.tests.filter((t) => t.status === "PASS").length,
                                failed: projectState.tests.filter((t) => t.status === "FAIL").length,
                                notRun: projectState.tests.filter((t) => t.status === "NOT_RUN").length,
                            }, bugs: {
                                total: projectState.bugs.length,
                                open: projectState.bugs.filter((b) => b.status === "OPEN").length,
                                fixed: projectState.bugs.filter((b) => b.status === "FIXED" || b.status === "VERIFIED").length,
                            }, tasks: projectState.tasks }) }), _jsx(Box, { width: "40%", paddingLeft: 1, children: _jsx(RecoveryPanel, { health: health, checkpoints: checkpoints, recoveryCount: recoveryCount }) })] }), _jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { width: "50%", children: _jsx(TaskList, { tasks: projectState.tasks }) }), _jsx(Box, { width: "50%", paddingLeft: 1, children: _jsx(LogViewer, { logs: logs }) })] })] }));
}
function calculateUptime(startedAt) {
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
//# sourceMappingURL=dashboard.js.map