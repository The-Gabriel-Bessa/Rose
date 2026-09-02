import type { AgentHealthCheck, AgentMetrics, RecoveryCheckpoint, RecoveryConfig } from "./recovery-types.js";
export declare class RecoveryManager {
    private config;
    private checkpoints;
    private healthHistory;
    private attemptHistory;
    private solutionHistory;
    private recoveryCount;
    private lastSuccessTime;
    constructor(config?: Partial<RecoveryConfig>);
    checkAgentHealth(metrics: AgentMetrics, verifyFn?: (claim: string) => Promise<boolean>): Promise<AgentHealthCheck>;
    private detectDegradation;
    verifyClaim(claim: string, actualState: string): Promise<{
        verified: boolean;
        confidence: number;
        reason: string;
    }>;
    detectHallucination(agentStatement: string, actualResults: string[]): {
        isHallucination: boolean;
        confidence: number;
        reason: string;
    };
    detectLoop(attempts: string[]): {
        isLoop: boolean;
        pattern: string;
        count: number;
    };
    private normalizeSolution;
    recordAttempt(attempt: string): void;
    recordSolution(solution: string): void;
    markSuccess(): void;
    createCheckpoint(data: {
        objective: string;
        currentTask: string;
        completedTasks: string[];
        pendingTasks: string[];
        knownBugs: string[];
        testResults: {
            passed: string[];
            failed: string[];
        };
        failedApproaches: string[];
        recentChanges: string[];
        gitStatus: string;
        gitDiff: string;
        buildState: "passing" | "failing" | "unknown";
        reasonForRecovery: string;
        previousSessionId: string;
    }): Promise<RecoveryCheckpoint>;
    getCheckpoint(id: string): RecoveryCheckpoint | undefined;
    getLastCheckpoint(): RecoveryCheckpoint | undefined;
    generateRecoveryPrompt(checkpoint: RecoveryCheckpoint): string;
    shouldRecover(): boolean;
    getRecoveryCount(): number;
    getHealthHistory(): AgentHealthCheck[];
    getCheckpoints(): RecoveryCheckpoint[];
    getAttemptHistory(): string[];
    getSolutionHistory(): string[];
    reset(): void;
}
//# sourceMappingURL=recovery.d.ts.map