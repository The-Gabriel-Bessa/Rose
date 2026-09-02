import type {
  AgentHealthStatus,
  AgentHealthCheck,
  AgentMetrics,
  RecoveryCheckpoint,
  RecoveryConfig,
  DegradationType,
} from "./recovery-types.js";

const DEFAULT_RECOVERY_CONFIG: RecoveryConfig = {
  maxRecoveryAttempts: 5,
  healthCheckInterval: 30000,
  repetitionThreshold: 3,
  loopDetectionWindow: 5,
  hallucinationConfidenceThreshold: 0.7,
  contextLossThreshold: 0.3,
};

export class RecoveryManager {
  private config: RecoveryConfig;
  private checkpoints: RecoveryCheckpoint[] = [];
  private healthHistory: AgentHealthCheck[] = [];
  private attemptHistory: string[] = [];
  private solutionHistory: string[] = [];
  private recoveryCount = 0;
  private lastSuccessTime = Date.now();

  constructor(config: Partial<RecoveryConfig> = {}) {
    this.config = { ...DEFAULT_RECOVERY_CONFIG, ...config };
  }

  async checkAgentHealth(
    metrics: AgentMetrics,
    verifyFn?: (claim: string) => Promise<boolean>
  ): Promise<AgentHealthCheck> {
    const healthCheck: AgentHealthCheck = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      score: 100,
      details: "",
      metrics,
    };

    const degradation = this.detectDegradation(metrics, verifyFn);

    if (degradation) {
      healthCheck.status = degradation.status;
      healthCheck.score = degradation.score;
      healthCheck.degradationType = degradation.type;
      healthCheck.details = degradation.details;
    }

    this.healthHistory.push(healthCheck);

    return healthCheck;
  }

  private detectDegradation(
    metrics: AgentMetrics,
    verifyFn?: (claim: string) => Promise<boolean>
  ): { status: AgentHealthStatus; score: number; type: DegradationType; details: string } | null {
    if (metrics.failedAttempts > this.config.repetitionThreshold * 2) {
      return {
        status: "failed",
        score: 0,
        type: "excessive_retries",
        details: `Agent has failed ${metrics.failedAttempts} times consecutively`,
      };
    }

    if (metrics.repeatedSolutions >= this.config.repetitionThreshold) {
      return {
        status: "critical",
        score: 20,
        type: "loop_detected",
        details: `Agent has tried ${metrics.repeatedSolutions} similar solutions without success`,
      };
    }

    if (metrics.uniqueSolutions < metrics.attemptCount * 0.3) {
      return {
        status: "degraded",
        score: 50,
        type: "repetition",
        details: `Agent is repeating approaches (${metrics.uniqueSolutions} unique out of ${metrics.attemptCount} attempts)`,
      };
    }

    if (metrics.errorRate > 0.7) {
      return {
        status: "degraded",
        score: 40,
        type: "incoherent_solution",
        details: `High error rate: ${Math.round(metrics.errorRate * 100)}%`,
      };
    }

    if (metrics.timeSinceLastSuccess > 300000) {
      return {
        status: "degraded",
        score: 60,
        type: "context_loss",
        details: `No successful action in ${Math.round(metrics.timeSinceLastSuccess / 1000)}s`,
      };
    }

    return null;
  }

  async verifyClaim(
    claim: string,
    actualState: string
  ): Promise<{ verified: boolean; confidence: number; reason: string }> {
    const claimLower = claim.toLowerCase();
    const actualLower = actualState.toLowerCase();

    if (claimLower.includes("fixed") && actualLower.includes("error")) {
      return {
        verified: false,
        confidence: 0.9,
        reason: "Agent claims fix but errors still present",
      };
    }

    if (claimLower.includes("implemented") && !actualLower.includes(claimLower.substring(0, 20))) {
      return {
        verified: false,
        confidence: 0.8,
        reason: "Claimed implementation not found in actual state",
      };
    }

    if (claimLower.includes("test") && actualLower.includes("fail")) {
      return {
        verified: false,
        confidence: 0.85,
        reason: "Agent claims test success but failures exist",
      };
    }

    return {
      verified: true,
      confidence: 0.5,
      reason: "Claim cannot be definitively verified or contradicted",
    };
  }

  detectHallucination(
    agentStatement: string,
    actualResults: string[]
  ): { isHallucination: boolean; confidence: number; reason: string } {
    const statement = agentStatement.toLowerCase();

    for (const result of actualResults) {
      const resultLower = result.toLowerCase();

      if (statement.includes("success") && resultLower.includes("fail")) {
        return {
          isHallucination: true,
          confidence: 0.9,
          reason: "Agent claims success but test shows failure",
        };
      }

      if (statement.includes("created") && resultLower.includes("not found")) {
        return {
          isHallucination: true,
          confidence: 0.85,
          reason: "Agent claims creation but file not found",
        };
      }

      if (statement.includes("fixed") && resultLower.includes("still exists")) {
        return {
          isHallucination: true,
          confidence: 0.95,
          reason: "Agent claims fix but issue persists",
        };
      }
    }

    return {
      isHallucination: false,
      confidence: 0.3,
      reason: "No contradiction detected",
    };
  }

  detectLoop(attempts: string[]): { isLoop: boolean; pattern: string; count: number } {
    const recentAttempts = attempts.slice(-this.config.loopDetectionWindow);

    const solutionCounts = new Map<string, number>();
    for (const attempt of recentAttempts) {
      const normalized = this.normalizeSolution(attempt);
      solutionCounts.set(normalized, (solutionCounts.get(normalized) || 0) + 1);
    }

    for (const [solution, count] of solutionCounts) {
      if (count >= this.config.repetitionThreshold) {
        return {
          isLoop: true,
          pattern: solution,
          count,
        };
      }
    }

    return { isLoop: false, pattern: "", count: 0 };
  }

  private normalizeSolution(solution: string): string {
    return solution
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 100);
  }

  recordAttempt(attempt: string): void {
    this.attemptHistory.push(attempt);
  }

  recordSolution(solution: string): void {
    this.solutionHistory.push(solution);
  }

  markSuccess(): void {
    this.lastSuccessTime = Date.now();
  }

  async createCheckpoint(data: {
    objective: string;
    currentTask: string;
    completedTasks: string[];
    pendingTasks: string[];
    knownBugs: string[];
    testResults: { passed: string[]; failed: string[] };
    failedApproaches: string[];
    recentChanges: string[];
    gitStatus: string;
    gitDiff: string;
    buildState: "passing" | "failing" | "unknown";
    reasonForRecovery: string;
    previousSessionId: string;
  }): Promise<RecoveryCheckpoint> {
    this.recoveryCount++;

    const checkpoint: RecoveryCheckpoint = {
      id: `checkpoint-${String(this.recoveryCount).padStart(3, "0")}`,
      timestamp: new Date().toISOString(),
      ...data,
      recoveryCount: this.recoveryCount,
    };

    this.checkpoints.push(checkpoint);
    return checkpoint;
  }

  getCheckpoint(id: string): RecoveryCheckpoint | undefined {
    return this.checkpoints.find((c) => c.id === id);
  }

  getLastCheckpoint(): RecoveryCheckpoint | undefined {
    return this.checkpoints[this.checkpoints.length - 1];
  }

  generateRecoveryPrompt(checkpoint: RecoveryCheckpoint): string {
    return `You are entering an existing project after another development agent failed to complete the current task.

Do NOT blindly trust the previous agent's conclusions.

Inspect the ACTUAL project state first.

Verify:
- filesystem
- source code
- git status
- git diff
- tests
- build state
- logs
- requirements
- known bugs
- previous failed approaches

The previous agent may have been incorrect.

Your job is to independently determine the current state of the project and continue from the VERIFIED state.

Do not repeat approaches that have already failed unless you can explain why they should work now.
Do not claim something is fixed until it has been actually verified.

PROJECT STATE:
Objective: ${checkpoint.objective}
Current Task: ${checkpoint.currentTask}
Completed Tasks: ${checkpoint.completedTasks.join(", ") || "None"}
Pending Tasks: ${checkpoint.pendingTasks.join(", ") || "None"}
Known Bugs: ${checkpoint.knownBugs.join(", ") || "None"}
Failed Approaches: ${checkpoint.failedApproaches.join("\n  ") || "None"}
Build State: ${checkpoint.buildState}
Git Status: ${checkpoint.gitStatus}

Previous session failed because: ${checkpoint.reasonForRecovery}

Start by verifying the current state of the project, then continue from there.`;
  }

  shouldRecover(): boolean {
    if (this.recoveryCount >= this.config.maxRecoveryAttempts) {
      return false;
    }

    const recentHealth = this.healthHistory.slice(-3);
    const degradedCount = recentHealth.filter(
      (h) => h.status === "degraded" || h.status === "critical" || h.status === "failed"
    ).length;

    return degradedCount >= 2;
  }

  getRecoveryCount(): number {
    return this.recoveryCount;
  }

  getHealthHistory(): AgentHealthCheck[] {
    return [...this.healthHistory];
  }

  getCheckpoints(): RecoveryCheckpoint[] {
    return [...this.checkpoints];
  }

  getAttemptHistory(): string[] {
    return [...this.attemptHistory];
  }

  getSolutionHistory(): string[] {
    return [...this.solutionHistory];
  }

  reset(): void {
    this.attemptHistory = [];
    this.solutionHistory = [];
    this.healthHistory = [];
  }
}
