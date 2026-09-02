import React from "react";
import type { Task } from "../types/project.js";
interface StatsPanelProps {
    requirements: {
        total: number;
        validated: number;
    };
    tests: {
        total: number;
        passed: number;
        failed: number;
        notRun: number;
    };
    bugs: {
        total: number;
        open: number;
        fixed: number;
    };
    tasks: Task[];
}
export declare function StatsPanel({ requirements, tests, bugs, tasks }: StatsPanelProps): React.JSX.Element;
export {};
//# sourceMappingURL=stats-panel.d.ts.map