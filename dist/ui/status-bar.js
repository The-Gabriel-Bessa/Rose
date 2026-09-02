import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from "ink";
export function StatusBar({ state, projectName, iteration, uptime }) {
    const stateColor = getStateColor(state);
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "cyan", padding: 1, marginBottom: 1, children: [_jsxs(Box, { justifyContent: "space-between", children: [_jsx(Text, { bold: true, color: "cyan", children: "ROSE ORCHESTRATOR" }), _jsx(Text, { color: "gray", children: "v0.1.0" })] }), _jsxs(Box, { justifyContent: "space-between", marginTop: 1, children: [_jsxs(Text, { children: ["Project: ", _jsx(Text, { bold: true, color: "white", children: projectName })] }), _jsxs(Text, { children: ["Iteration: ", _jsx(Text, { bold: true, color: "yellow", children: iteration })] }), _jsxs(Text, { children: ["Uptime: ", _jsx(Text, { color: "green", children: uptime })] })] }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { children: ["Status: ", _jsx(Text, { bold: true, color: stateColor, children: state })] }) })] }));
}
function getStateColor(state) {
    switch (state) {
        case "COMPLETED":
            return "green";
        case "FAILED":
        case "BLOCKED":
        case "TIMEOUT":
            return "red";
        case "BUG_FOUND":
            return "yellow";
        case "FIXING":
        case "RETESTING":
            return "yellow";
        case "TESTING":
        case "BUILDING":
            return "blue";
        case "IMPLEMENTING":
            return "magenta";
        default:
            return "white";
    }
}
//# sourceMappingURL=status-bar.js.map