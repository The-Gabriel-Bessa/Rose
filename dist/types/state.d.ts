export type RoseState = "IDLE" | "ANALYZING" | "PLANNING" | "IMPLEMENTING" | "BUILDING" | "TESTING" | "INSPECTING" | "BUG_FOUND" | "FIXING" | "RETESTING" | "IMPROVING" | "IMPROVEMENT_SCAN" | "FINAL_VALIDATION" | "CODE_REVIEW" | "COMPLETED" | "BLOCKED" | "FAILED" | "TIMEOUT" | "USER_REQUIRED";
export interface RoseConfig {
    maxIterations: number;
    maxFixAttempts: number;
    timeoutPerTask: number;
    timeoutPerTest: number;
    maxRepeatedFailure: number;
    openCodeHostname: string;
    openCodePort: number;
}
export declare const DEFAULT_CONFIG: RoseConfig;
//# sourceMappingURL=state.d.ts.map