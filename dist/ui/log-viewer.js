import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Text } from "ink";
export function LogViewer({ logs, maxLines = 15 }) {
    const [autoScroll, setAutoScroll] = useState(true);
    const recentLogs = logs.slice(-maxLines);
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", padding: 1, children: [_jsxs(Box, { justifyContent: "space-between", marginBottom: 1, children: [_jsx(Text, { bold: true, color: "gray", children: "LOGS" }), _jsxs(Text, { color: "gray", children: [logs.length, " entries"] })] }), _jsx(Box, { flexDirection: "column", height: maxLines, children: recentLogs.map((log, index) => (_jsx(LogLine, { log: log }, index))) })] }));
}
function LogLine({ log }) {
    const color = getLevelColor(log.level);
    const icon = getLevelIcon(log.level);
    return (_jsxs(Box, { children: [_jsxs(Text, { color: "gray", children: [log.timestamp, " "] }), _jsxs(Text, { color: color, children: [icon, " "] }), _jsx(Text, { children: log.message })] }));
}
function getLevelColor(level) {
    switch (level) {
        case "error":
            return "red";
        case "warn":
            return "yellow";
        case "success":
            return "green";
        default:
            return "white";
    }
}
function getLevelIcon(level) {
    switch (level) {
        case "error":
            return "✗";
        case "warn":
            return "⚠";
        case "success":
            return "✓";
        default:
            return "●";
    }
}
//# sourceMappingURL=log-viewer.js.map