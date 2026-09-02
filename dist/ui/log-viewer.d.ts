import React from "react";
interface LogEntry {
    timestamp: string;
    level: "info" | "warn" | "error" | "success";
    message: string;
}
interface LogViewerProps {
    logs: LogEntry[];
    maxLines?: number;
}
export declare function LogViewer({ logs, maxLines }: LogViewerProps): React.JSX.Element;
export {};
//# sourceMappingURL=log-viewer.d.ts.map