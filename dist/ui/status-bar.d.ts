import React from "react";
import type { RoseState } from "../types/state.js";
interface StatusBarProps {
    state: RoseState;
    projectName: string;
    iteration: number;
    uptime: string;
}
export declare function StatusBar({ state, projectName, iteration, uptime }: StatusBarProps): React.JSX.Element;
export {};
//# sourceMappingURL=status-bar.d.ts.map