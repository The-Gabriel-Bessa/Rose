import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from "ink";
export function RecoveryPanel({ health, checkpoints, recoveryCount }) {
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "magenta", padding: 1, marginBottom: 1, children: [_jsxs(Box, { justifyContent: "space-between", marginBottom: 1, children: [_jsx(Text, { bold: true, color: "magenta", children: "AGENT RECOVERY" }), _jsxs(Text, { color: "gray", children: [recoveryCount, " recoveries"] })] }), health && (_jsxs(Box, { marginBottom: 1, children: [_jsxs(Box, { flexDirection: "column", width: "50%", children: [_jsx(Text, { bold: true, color: "cyan", children: "Health Status" }), _jsxs(Text, { color: getHealthColor(health.status), children: [health.status.toUpperCase(), " (Score: ", health.score, "/100)"] })] }), _jsxs(Box, { flexDirection: "column", width: "50%", children: [_jsx(Text, { bold: true, color: "cyan", children: "Metrics" }), _jsxs(Text, { children: ["Attempts: ", health.metrics.attemptCount, " | Failed: ", health.metrics.failedAttempts, " | Error Rate: ", Math.round(health.metrics.errorRate * 100), "%"] })] })] })), checkpoints.length > 0 && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, color: "cyan", children: "Recent Checkpoints" }), checkpoints.slice(-3).map((cp, index) => (_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: "gray", children: [cp.id, ": ", cp.reasonForRecovery] }) }, index)))] }))] }));
}
function getHealthColor(status) {
    switch (status) {
        case "healthy":
            return "green";
        case "degraded":
            return "yellow";
        case "critical":
            return "red";
        case "failed":
            return "red";
        default:
            return "white";
    }
}
//# sourceMappingURL=recovery-panel.js.map