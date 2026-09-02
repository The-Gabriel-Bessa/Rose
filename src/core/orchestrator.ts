import { StateMachine } from "./state-machine.js";
import { ProjectMemory } from "./memory.js";
import { RoseClient, SessionManager } from "../opencode-adapter/index.js";
import { RecoveryManager, StateVerifier } from "../diagnostics/index.js";
import type { RoseConfig, RoseState } from "../types/state.js";
import { DEFAULT_CONFIG } from "../types/state.js";
import type { Task, Bug, TestCase } from "../types/project.js";
import type { AgentMetrics } from "../diagnostics/recovery-types.js";

export interface OrchestratorEvents {
  onStateChange?: (state: RoseState, previous: RoseState) => void;
  onProgress?: (message: string) => void;
  onError?: (error: Error) => void;
  onBugFound?: (bug: Bug) => void;
  onTestResult?: (test: TestCase) => void;
  onTaskComplete?: (task: Task) => void;
  onUserRequired?: (question: string, options: string[]) => void;
  onRecovery?: (checkpointId: string, reason: string) => void;
  onAgentHealth?: (status: string, score: number) => void;
}

export class Orchestrator {
  private stateMachine: StateMachine;
  private memory: ProjectMemory;
  private sessionManager: SessionManager;
  private client: RoseClient;
  private recoveryManager: RecoveryManager;
  private stateVerifier: StateVerifier;
  private config: RoseConfig;
  private events: OrchestratorEvents;
  private iterationCount = 0;
  private fixAttemptCount = 0;
  private running = false;
  private agentAttemptCount = 0;
  private agentSuccessCount = 0;
  private agentFailCount = 0;

  constructor(
    projectName: string,
    objective: string,
    config: Partial<RoseConfig> = {},
    events: OrchestratorEvents = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stateMachine = new StateMachine();
    this.memory = new ProjectMemory(projectName, objective);
    this.client = new RoseClient(this.config);
    this.sessionManager = new SessionManager(this.client);
    this.recoveryManager = new RecoveryManager();
    this.stateVerifier = new StateVerifier();
    this.events = events;

    this.stateMachine.onTransition(
      ["IDLE", "ANALYZING", "PLANNING", "IMPLEMENTING", "BUILDING", "TESTING", "INSPECTING", "BUG_FOUND", "FIXING", "RETESTING", "IMPROVING", "IMPROVEMENT_SCAN", "FINAL_VALIDATION", "CODE_REVIEW"],
      (state) => {
        this.memory.updateState(state);
        this.events.onStateChange?.(state, this.stateMachine.state);
      }
    );
  }

  get currentState(): RoseState {
    return this.stateMachine.state;
  }

  get projectState() {
    return this.memory.getState();
  }

  async createSession(title: string): Promise<string> {
    return await this.sessionManager.createNewSession(title);
  }

  async start(): Promise<void> {
    this.running = true;
    await this.createSession("Rose: " + this.memory.getState().projectName);
    this.transition("ANALYZING");
    await this.runCycle();
  }

  private async runCycle(): Promise<void> {
    while (this.running && !this.stateMachine.isTerminal()) {
      try {
        await this.executeCurrentState();
      } catch (error) {
        this.events.onError?.(error as Error);
        this.handleCycleError(error as Error);
      }

      if (this.iterationCount >= this.config.maxIterations) {
        this.transition("TIMEOUT");
        break;
      }

      await this.delay(100);
    }
  }

  private async executeCurrentState(): Promise<void> {
    const state = this.stateMachine.state;

    switch (state) {
      case "ANALYZING":
        await this.analyze();
        break;
      case "PLANNING":
        await this.plan();
        break;
      case "IMPLEMENTING":
        await this.implement();
        break;
      case "BUILDING":
        await this.build();
        break;
      case "TESTING":
        await this.test();
        break;
      case "INSPECTING":
        await this.inspect();
        break;
      case "BUG_FOUND":
        await this.diagnoseBug();
        break;
      case "FIXING":
        await this.fix();
        break;
      case "RETESTING":
        await this.retest();
        break;
      case "IMPROVING":
        await this.improve();
        break;
      case "IMPROVEMENT_SCAN":
        await this.scanImprovements();
        break;
      case "FINAL_VALIDATION":
        await this.finalValidation();
        break;
      case "CODE_REVIEW":
        await this.codeReview();
        break;
      case "USER_REQUIRED":
        await this.handleUserRequired();
        break;
      default:
        break;
    }
  }

  private async analyze(): Promise<void> {
    this.events.onProgress?.("Analyzing project objective...");

    const analysis = await this.sessionManager.sendTask(
      `Analyze the following objective and break it down into clear, testable requirements:\n\n` +
      `Objective: ${this.memory.getState().objective}\n\n` +
      `For each requirement, provide:\n` +
      `- A clear description\n` +
      `- Acceptance criteria\n` +
      `- Test scenarios\n\n` +
      `Format your response as a structured list.`
    );

    const requirementDescriptions = this.parseRequirements(analysis);
    for (const desc of requirementDescriptions) {
      this.memory.addRequirement(desc);
    }

    this.events.onProgress?.(`Identified ${requirementDescriptions.length} requirements`);
    this.transition("PLANNING");
  }

  private async plan(): Promise<void> {
    this.events.onProgress?.("Creating implementation plan...");

    const state = this.memory.getState();
    const requirements = state.requirements.map(
      (r) => `${r.id}: ${r.description}`
    ).join("\n");

    const plan = await this.sessionManager.sendTask(
      `Create a detailed implementation plan for these requirements:\n\n` +
      `${requirements}\n\n` +
      `For each task, provide:\n` +
      `- Title\n` +
      `- Description\n` +
      `- Dependencies\n` +
      `- Estimated complexity\n\n` +
      `Order tasks by dependency and complexity.`
    );

    const tasks = this.parseTasks(plan);
    for (const task of tasks) {
      this.memory.addTask(task);
    }

    this.events.onProgress?.(`Created ${tasks.length} tasks`);
    this.iterationCount++;
    this.memory.startIteration();
    this.transition("IMPLEMENTING");
  }

  private async implement(): Promise<void> {
    this.events.onProgress?.("Implementing tasks...");

    const pendingTasks = this.memory.getState().tasks.filter(
      (t) => t.status === "PENDING"
    );

    for (const task of pendingTasks) {
      this.memory.updateTask(task.id, { status: "IN_PROGRESS" });

      try {
        const result = await this.sessionManager.sendTask(
          `Implement the following task:\n\n` +
          `Title: ${task.title}\n` +
          `Description: ${task.description}\n` +
          (task.requirementId ? `Requirement: ${task.requirementId}\n` : "") +
          `\nPlease implement this feature/task. Write clean, tested code.`
        );

        this.memory.updateTask(task.id, {
          status: "COMPLETED",
          result,
        });
        this.events.onTaskComplete?.(task);
      } catch (error) {
        this.memory.updateTask(task.id, {
          status: "FAILED",
          error: (error as Error).message,
        });
      }
    }

    this.transition("BUILDING");
  }

  private async build(): Promise<void> {
    this.events.onProgress?.("Building project...");

    const sessionId = this.sessionManager.activeSession;
    if (!sessionId) {
      this.transition("FAILED");
      return;
    }

    try {
      await this.client.runShell(sessionId, "npm run build 2>&1 || echo BUILD_FAILED");
      this.transition("TESTING");
    } catch (error) {
      this.events.onError?.(error as Error);
      this.transition("FAILED");
    }
  }

  private async test(): Promise<void> {
    this.events.onProgress?.("Running tests...");

    const sessionId = this.sessionManager.activeSession;
    if (!sessionId) {
      this.transition("FAILED");
      return;
    }

    const testCases = this.generateTestCases();

    for (const test of testCases) {
      this.memory.addTest(test);
    }

    try {
      const result = await this.client.runShell(
        sessionId,
        "npm test 2>&1 || echo TESTS_FAILED"
      );

      const failedTests = this.parseTestResults(result || "");

      for (const test of this.memory.getState().tests) {
        if (failedTests.includes(test.title)) {
          this.memory.addTest({ ...test, status: "FAIL" });
        } else {
          this.memory.addTest({ ...test, status: "PASS" });
        }
      }

      if (failedTests.length > 0) {
        this.transition("BUG_FOUND");
      } else {
        this.transition("INSPECTING");
      }
    } catch (error) {
      this.events.onError?.(error as Error);
      this.transition("BUG_FOUND");
    }
  }

  private async inspect(): Promise<void> {
    this.events.onProgress?.("Inspecting results...");

    const stats = this.memory.getTestStats();
    const bugStats = this.memory.getBugStats();

    this.events.onProgress?.(
      `Tests: ${stats.passed}/${stats.total} passed | ` +
      `Bugs: ${bugStats.open} open, ${bugStats.fixed} fixed`
    );

    if (bugStats.open > 0) {
      this.transition("BUG_FOUND");
    } else if (stats.notRun > 0) {
      this.transition("TESTING");
    } else {
      this.transition("IMPROVEMENT_SCAN");
    }
  }

  private async diagnoseBug(): Promise<void> {
    this.events.onProgress?.("Diagnosing bugs...");

    const openBugs = this.memory.getState().bugs.filter(
      (b) => b.status === "OPEN"
    );

    for (const bug of openBugs) {
      const diagnosis = await this.sessionManager.sendTask(
        `Analyze the following bug and provide a detailed diagnosis:\n\n` +
        `Bug: ${bug.title}\n` +
        `Description: ${bug.description}\n` +
        `Steps to reproduce:\n${bug.steps.join("\n")}\n` +
        `Expected: ${bug.expected}\n` +
        `Actual: ${bug.actual}\n\n` +
        `Provide:\n` +
        `1. Root cause analysis\n` +
        `2. Affected files\n` +
        `3. Suggested fix approach\n` +
        `4. Potential regressions`
      );

      this.memory.updateBug(bug.id, {
        status: "IN_PROGRESS",
        description: `${bug.description}\n\nDiagnosis:\n${diagnosis}`,
      });
    }

    this.transition("FIXING");
  }

  private async fix(): Promise<void> {
    this.events.onProgress?.("Fixing bugs...");

    this.fixAttemptCount++;
    const openBugs = this.memory.getState().bugs.filter(
      (b) => b.status === "IN_PROGRESS"
    );

    for (const bug of openBugs) {
      if (bug.fixAttempts >= this.config.maxFixAttempts) {
        this.memory.updateBug(bug.id, { status: "WONT_FIX" });
        continue;
      }

      try {
        const result = await this.sessionManager.sendTask(
          `Fix the following bug:\n\n` +
          `Bug ID: ${bug.id}\n` +
          `Title: ${bug.title}\n` +
          `Diagnosis:\n${bug.description}\n\n` +
          `Important:\n` +
          `- Fix the ROOT CAUSE, not just the symptom\n` +
          `- Do not remove or skip tests\n` +
          `- Do not use generic try/catch to hide errors\n` +
          `- Implement a proper fix\n` +
          `- After fixing, verify the original test scenario works`
        );

        this.memory.updateBug(bug.id, {
          fixAttempts: bug.fixAttempts + 1,
        });
      } catch (error) {
        this.events.onError?.(error as Error);
      }
    }

    this.transition("RETESTING");
  }

  private async retest(): Promise<void> {
    this.events.onProgress?.("Retesting after fixes...");

    const sessionId = this.sessionManager.activeSession;
    if (!sessionId) {
      this.transition("FAILED");
      return;
    }

    try {
      const result = await this.client.runShell(sessionId, "npm test 2>&1 || echo TESTS_FAILED");
      const failedTests = this.parseTestResults(result || "");

      const bugsStillFailing: string[] = [];

      for (const test of this.memory.getState().tests) {
        if (failedTests.includes(test.title)) {
          bugsStillFailing.push(test.id);
        }
      }

      if (bugsStillFailing.length > 0 && this.fixAttemptCount < this.config.maxFixAttempts) {
        this.transition("FIXING");
      } else if (bugsStillFailing.length > 0) {
        this.transition("BLOCKED");
      } else {
        this.memory.completeIteration();
        this.iterationCount++;
        this.fixAttemptCount = 0;
        this.transition("TESTING");
      }
    } catch (error) {
      this.events.onError?.(error as Error);
      this.transition("FIXING");
    }
  }

  private async scanImprovements(): Promise<void> {
    this.events.onProgress?.("Scanning for improvements...");

    const sessionId = this.sessionManager.activeSession;
    if (!sessionId) {
      this.transition("FINAL_VALIDATION");
      return;
    }

    const analysis = await this.sessionManager.sendTask(
      `Analyze the current codebase and identify improvements:\n\n` +
      `1. Is there duplicated code?\n` +
      `2. Are there unhandled errors?\n` +
      `3. Are there important warnings?\n` +
      `4. Are there missing tests?\n` +
      `5. Are there partially implemented features?\n` +
      `6. Are there critical TODOs?\n` +
      `7. Are there broken dependencies?\n` +
      `8. Are there obvious performance issues?\n` +
      `9. Are there UX issues?\n` +
      `10. Are there inconsistencies between requirements and implementation?\n\n` +
      `Provide a structured report with prioritized suggestions.`
    );

    this.events.onProgress?.("Improvement scan complete");
    this.transition("FINAL_VALIDATION");
  }

  private async improve(): Promise<void> {
    this.events.onProgress?.("Applying improvements...");
    this.transition("IMPLEMENTING");
  }

  private async finalValidation(): Promise<void> {
    this.events.onProgress?.("Running final validation...");

    const reqStats = this.memory.getRequirementStats();
    const testStats = this.memory.getTestStats();
    const bugStats = this.memory.getBugStats();

    this.events.onProgress?.(
      `Requirements: ${reqStats.validated}/${reqStats.total} validated | ` +
      `Tests: ${testStats.passed}/${testStats.total} passed | ` +
      `Bugs: ${bugStats.fixed}/${bugStats.total} fixed`
    );

    this.transition("CODE_REVIEW");
  }

  private async codeReview(): Promise<void> {
    this.events.onProgress?.("Performing code review...");

    const sessionId = this.sessionManager.activeSession;
    if (!sessionId) {
      this.transition("COMPLETED");
      return;
    }

    const review = await this.sessionManager.sendTask(
      `Perform a comprehensive code review:\n\n` +
      `Evaluate:\n` +
      `1. Correctness\n` +
      `2. Architecture\n` +
      `3. Maintainability\n` +
      `4. Security\n` +
      `5. Performance\n` +
      `6. Error handling\n` +
      `7. Testing\n` +
      `8. UX\n` +
      `9. Requirements compliance\n` +
      `10. Regression risk\n\n` +
      `Provide:\n` +
      `- Quality scores (0-100) for each category\n` +
      `- List of issues found\n` +
      `- Recommendations\n` +
      `- Overall assessment`
    );

    this.memory.addDecision(`Code review completed`);
    this.transition("COMPLETED");
  }

  private async handleUserRequired(): Promise<void> {
    this.events.onUserRequired?.(
      "The orchestrator needs your input to continue.",
      ["Continue", "Pause", "Abort"]
    );
    this.running = false;
  }

  private parseRequirements(analysis: string): string[] {
    const lines = analysis.split("\n");
    const requirements: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("- ") ||
        trimmed.startsWith("* ") ||
        trimmed.match(/^\d+\.\s/)
      ) {
        const desc = trimmed.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "");
        if (desc.length > 10) {
          requirements.push(desc);
        }
      }
    }

    return requirements.length > 0 ? requirements : ["Complete the stated objective"];
  }

  private parseTasks(plan: string): Omit<Task, "id" | "createdAt" | "updatedAt">[] {
    const lines = plan.split("\n");
    const tasks: Omit<Task, "id" | "createdAt" | "updatedAt">[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("- ") ||
        trimmed.startsWith("* ") ||
        trimmed.match(/^\d+\.\s/)
      ) {
        const desc = trimmed.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "");
        if (desc.length > 10) {
          tasks.push({
            title: desc.substring(0, 100),
            description: desc,
            status: "PENDING",
            dependencies: [],
          });
        }
      }
    }

    return tasks.length > 0 ? tasks : [{
      title: "Implement objective",
      description: this.memory.getState().objective,
      status: "PENDING",
      dependencies: [],
    }];
  }

  private generateTestCases(): Omit<TestCase, "id" | "createdAt" | "updatedAt">[] {
    const requirements = this.memory.getState().requirements;
    const tests: Omit<TestCase, "id" | "createdAt" | "updatedAt">[] = [];

    for (const req of requirements) {
      tests.push({
        requirementId: req.id,
        title: `Test ${req.id}: Happy path`,
        description: `Verify ${req.description} works correctly`,
        steps: ["Execute the feature", "Verify expected behavior"],
        expected: "Feature works as described",
        status: "NOT_RUN",
        type: "e2e",
      });

      tests.push({
        requirementId: req.id,
        title: `Test ${req.id}: Edge cases`,
        description: `Verify ${req.description} handles edge cases`,
        steps: ["Provide invalid input", "Verify error handling"],
        expected: "Graceful error handling",
        status: "NOT_RUN",
        type: "e2e",
      });
    }

    return tests;
  }

  private parseTestResults(output: string): string[] {
    const failed: string[] = [];
    const lines = output.split("\n");

    for (const line of lines) {
      if (line.includes("FAIL") || line.includes("failed") || line.includes("error")) {
        const match = line.match(/test[:\s]+(.+)/i);
        if (match) {
          failed.push(match[1].trim());
        }
      }
    }

    return failed;
  }

  private async checkAgentHealth(): Promise<boolean> {
    this.agentAttemptCount++;

    const metrics: AgentMetrics = {
      attemptCount: this.agentAttemptCount,
      uniqueSolutions: new Set(this.recoveryManager.getSolutionHistory()).size,
      repeatedSolutions: this.agentAttemptCount - new Set(this.recoveryManager.getSolutionHistory()).size,
      failedAttempts: this.agentFailCount,
      successfulAttempts: this.agentSuccessCount,
      contextTokensUsed: 0,
      contextTokensRemaining: 100000,
      timeSinceLastSuccess: Date.now() - (this.recoveryManager as any).lastSuccessTime,
      errorRate: this.agentFailCount / Math.max(1, this.agentAttemptCount),
    };

    const healthCheck = await this.recoveryManager.checkAgentHealth(metrics);
    this.events.onAgentHealth?.(healthCheck.status, healthCheck.score);

    if (healthCheck.status === "critical" || healthCheck.status === "failed") {
      return false;
    }

    return true;
  }

  private async attemptRecovery(reason: string): Promise<boolean> {
    if (!this.recoveryManager.shouldRecover()) {
      this.events.onProgress?.("Max recovery attempts reached");
      return false;
    }

    this.events.onProgress?.(`Recovery triggered: ${reason}`);

    const state = this.memory.getState();
    const gitStatus = await this.stateVerifier.verifyGitStatus();
    const gitDiff = await this.stateVerifier.verifyGitDiff();

    const checkpoint = await this.recoveryManager.createCheckpoint({
      objective: state.objective,
      currentTask: state.tasks.find((t) => t.status === "IN_PROGRESS")?.title || "None",
      completedTasks: state.tasks.filter((t) => t.status === "COMPLETED").map((t) => t.title),
      pendingTasks: state.tasks.filter((t) => t.status === "PENDING").map((t) => t.title),
      knownBugs: state.bugs.filter((b) => b.status === "OPEN").map((b) => b.title),
      testResults: {
        passed: state.tests.filter((t) => t.status === "PASS").map((t) => t.id),
        failed: state.tests.filter((t) => t.status === "FAIL").map((t) => t.id),
      },
      failedApproaches: this.recoveryManager.getSolutionHistory().slice(-5),
      recentChanges: gitDiff.split("\n").slice(0, 20),
      gitStatus: `${gitStatus.branch} ${gitStatus.dirty ? "(dirty)" : "(clean)"}`,
      gitDiff: gitDiff.substring(0, 5000),
      buildState: "unknown",
      reasonForRecovery: reason,
      previousSessionId: this.sessionManager.activeSession || "unknown",
    });

    this.events.onRecovery?.(checkpoint.id, reason);

    await this.sessionManager.startNewSessionAfterContextFull(reason);

    this.agentAttemptCount = 0;
    this.agentSuccessCount = 0;
    this.agentFailCount = 0;
    this.recoveryManager.reset();

    const recoveryPrompt = this.recoveryManager.generateRecoveryPrompt(checkpoint);
    await this.sessionManager.sendTaskWithContext(
      "Continue the project from the verified state",
      recoveryPrompt
    );

    return true;
  }

  private recordAttempt(success: boolean, solution: string): void {
    this.recoveryManager.recordAttempt(solution);
    this.recoveryManager.recordSolution(solution);

    if (success) {
      this.agentSuccessCount++;
      this.recoveryManager.markSuccess();
    } else {
      this.agentFailCount++;
    }
  }

  private async handleCycleError(error: Error): Promise<void> {
    this.recordAttempt(false, `Error: ${error.message}`);

    if (this.fixAttemptCount >= this.config.maxFixAttempts) {
      const recovered = await this.attemptRecovery(`Too many fix attempts: ${error.message}`);
      if (recovered) {
        this.fixAttemptCount = 0;
        return;
      }
      this.transition("BLOCKED");
    }
  }

  private transition(to: RoseState): void {
    this.stateMachine.transition(to);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  stop(): void {
    this.running = false;
  }

  async pause(): Promise<void> {
    this.running = false;
    const summary = await this.sessionManager.summarizeSession();
    this.memory.addDecision(`Paused at ${this.currentState}. Summary saved.`);
  }

  async resume(): Promise<void> {
    this.running = true;
    await this.runCycle();
  }

  getRecoveryManager(): RecoveryManager {
    return this.recoveryManager;
  }

  getStateVerifier(): StateVerifier {
    return this.stateVerifier;
  }
}
