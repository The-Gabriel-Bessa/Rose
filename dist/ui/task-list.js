import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from "ink";
export function TaskList({ tasks }) {
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "yellow", padding: 1, marginBottom: 1, children: [_jsxs(Box, { justifyContent: "space-between", marginBottom: 1, children: [_jsx(Text, { bold: true, color: "yellow", children: "TASKS" }), _jsxs(Text, { color: "gray", children: [tasks.length, " total"] })] }), _jsx(Box, { flexDirection: "column", height: 10, children: tasks.slice(0, 10).map((task) => (_jsx(TaskItem, { task: task }, task.id))) })] }));
}
function TaskItem({ task }) {
    const { icon, color } = getStatusDisplay(task.status);
    return (_jsxs(Box, { children: [_jsxs(Text, { color: color, children: [icon, " "] }), _jsx(Text, { bold: true, children: task.id }), _jsx(Text, { color: "gray", children: ": " }), _jsx(Text, { children: task.title })] }));
}
function getStatusDisplay(status) {
    switch (status) {
        case "COMPLETED":
            return { icon: "✓", color: "green" };
        case "IN_PROGRESS":
            return { icon: "●", color: "yellow" };
        case "FAILED":
            return { icon: "✗", color: "red" };
        case "BLOCKED":
            return { icon: "⊘", color: "red" };
        default:
            return { icon: "○", color: "gray" };
    }
}
//# sourceMappingURL=task-list.js.map