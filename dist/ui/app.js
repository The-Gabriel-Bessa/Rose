import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Dashboard } from "./dashboard.js";
import { Orchestrator } from "../core/orchestrator.js";
export function App({ projectName, objective }) {
    const [state, setState] = useState("IDLE");
    const [projectState, setProjectState] = useState(null);
    const [logs, setLogs] = useState([]);
    const [health, setHealth] = useState(undefined);
    const [checkpoints, setCheckpoints] = useState([]);
    const [recoveryCount, setRecoveryCount] = useState(0);
    const [orchestrator, setOrchestrator] = useState(null);
    const [started, setStarted] = useState(false);
    const { exit } = useApp();
    const addLog = useCallback((level, message) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev.slice(-100), { timestamp, level, message }]);
    }, []);
    useEffect(() => {
        const orch = new Orchestrator(projectName, objective, {}, {
            onStateChange: (newState, previous) => {
                setState(newState);
                addLog("info", `${previous} → ${newState}`);
            },
            onProgress: (message) => {
                addLog("info", message);
            },
            onError: (error) => {
                addLog("error", error.message);
            },
            onBugFound: (bug) => {
                addLog("warn", `BUG FOUND: ${bug.title}`);
            },
            onTaskComplete: (task) => {
                addLog("success", `Task completed: ${task.title}`);
            },
            onRecovery: (checkpointId, reason) => {
                addLog("warn", `RECOVERY: ${checkpointId} - ${reason}`);
                setRecoveryCount((prev) => prev + 1);
                setCheckpoints(orch.getRecoveryManager().getCheckpoints());
            },
            onAgentHealth: (status, score) => {
                setHealth({
                    timestamp: new Date().toISOString(),
                    status: status,
                    score,
                    details: "",
                    metrics: {
                        attemptCount: 0,
                        uniqueSolutions: 0,
                        repeatedSolutions: 0,
                        failedAttempts: 0,
                        successfulAttempts: 0,
                        contextTokensUsed: 0,
                        contextTokensRemaining: 100000,
                        timeSinceLastSuccess: 0,
                        errorRate: 0,
                    },
                });
            },
        });
        setOrchestrator(orch);
        setProjectState(orch.projectState);
    }, [projectName, objective]);
    useInput((input, key) => {
        if (input === "q") {
            if (orchestrator) {
                orchestrator.stop();
            }
            exit();
        }
        if (input === "s" && !started && orchestrator) {
            setStarted(true);
            addLog("info", "Starting Rose Orchestrator...");
            orchestrator.start().then(() => {
                addLog("success", "Rose Orchestrator completed!");
                setProjectState(orchestrator.projectState);
            }).catch((error) => {
                addLog("error", `Error: ${error.message}`);
            });
        }
        if (input === "r" && orchestrator) {
            setProjectState(orchestrator.projectState);
            setCheckpoints(orchestrator.getRecoveryManager().getCheckpoints());
        }
    });
    if (!projectState) {
        return (_jsx(Box, { padding: 1, children: _jsx(Text, { color: "cyan", children: "Initializing Rose Orchestrator..." }) }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Dashboard, { state: state, projectState: projectState, logs: logs, health: health, checkpoints: checkpoints, recoveryCount: recoveryCount }), _jsx(Box, { borderStyle: "round", borderColor: "gray", padding: 1, marginTop: 1, children: _jsxs(Text, { color: "gray", children: ["Press ", _jsx(Text, { bold: true, color: "cyan", children: "S" }), " to start |", _jsx(Text, { bold: true, color: "cyan", children: " R" }), " to refresh |", _jsx(Text, { bold: true, color: "cyan", children: " Q" }), " to quit"] }) })] }));
}
//# sourceMappingURL=app.js.map