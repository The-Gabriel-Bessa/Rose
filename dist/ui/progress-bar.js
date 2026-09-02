import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from "ink";
export function ProgressBar({ current, total, width = 30, label }) {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    const filled = total > 0 ? Math.round((current / total) * width) : 0;
    const empty = width - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    const color = percentage >= 100 ? "green" : percentage >= 50 ? "yellow" : "red";
    return (_jsxs(Box, { flexDirection: "column", children: [label && (_jsx(Text, { color: "gray", children: label })), _jsxs(Box, { children: [_jsx(Text, { color: color, children: bar }), _jsxs(Text, { color: "white", children: [" ", percentage, "%"] })] }), _jsxs(Text, { color: "gray", children: [current, "/", total] })] }));
}
//# sourceMappingURL=progress-bar.js.map