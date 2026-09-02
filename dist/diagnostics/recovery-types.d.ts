export type AgentHealthStatus = "healthy" | "degraded" | "critical" | "failed";
export type DegradationType = "repetition" | "hallucination" | "loop_detected" | "context_loss" | "contradiction" | "phantom_execution" | "requirement_drift" | "incoherent_solution" | "excessive_retries" | "unrelated_modifications";
export interface AgentHealthCheck {
    timestamp: string;
    status: AgentHealthStatus;
    score: number;
    degradationType?: DegradationType;
    details: string;
    metrics: AgentMetrics;
}
export interface AgentMetrics {
    attemptCount: number;
    uniqueSolutions: number;
    repeatedSolutions: number;
    failedAttempts: number;
    successfulAttempts: number;
    contextTokensUsed: number;
    contextTokensRemaining: number;
    timeSinceLastSuccess: number;
    errorRate: number;
}
export interface RecoveryCheckpoint {
    id: string;
    timestamp: string;
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
    recoveryCount: number;
}
export interface RecoveryConfig {
    maxRecoveryAttempts: number;
    healthCheckInterval: number;
    repetitionThreshold: number;
    loopDetectionWindow: number;
    hallucinationConfidenceThreshold: number;
    contextLossThreshold: number;
}
//# sourceMappingURL=recovery-types.d.ts.map