import React from "react";
import type { AgentHealthCheck, RecoveryCheckpoint } from "../diagnostics/recovery-types.js";
interface RecoveryPanelProps {
    health?: AgentHealthCheck;
    checkpoints: RecoveryCheckpoint[];
    recoveryCount: number;
}
export declare function RecoveryPanel({ health, checkpoints, recoveryCount }: RecoveryPanelProps): React.JSX.Element;
export {};
//# sourceMappingURL=recovery-panel.d.ts.map