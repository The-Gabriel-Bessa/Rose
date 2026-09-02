import { Orchestrator } from "./core/orchestrator.js";
import { Persistence } from "./persistence/storage.js";
import type { RoseConfig } from "./types/state.js";

export { Orchestrator } from "./core/orchestrator.js";
export { StateMachine } from "./core/state-machine.js";
export { ProjectMemory } from "./core/memory.js";
export { Persistence } from "./persistence/storage.js";
export { RoseClient, SessionManager } from "./opencode-adapter/index.js";
export { UserSimulator, TestRunner, RegressionManager } from "./testing/index.js";
export { CodeReviewer, ImprovementEngine } from "./review/index.js";
export { RecoveryManager, StateVerifier } from "./diagnostics/index.js";
export type { RoseConfig, RoseState } from "./types/state.js";
export type { ProjectState, Requirement, TestCase, Bug, Task } from "./types/project.js";
export type {
  RegressionTest,
  RegressionSuite,
  RegressionResult,
} from "./testing/regression.js";
export type {
  ReviewCategory,
  IssueSeverity,
  CodeIssue,
  FileReview,
  ReviewReport,
} from "./review/reviewer.js";
export type {
  ImprovementCategory,
  ImprovementPriority,
  Improvement,
  ImprovementScanResult,
} from "./review/improvements.js";
export type {
  AgentHealthStatus,
  AgentHealthCheck,
  AgentMetrics,
  RecoveryCheckpoint,
  RecoveryConfig,
  DegradationType,
} from "./diagnostics/recovery-types.js";

export async function createRose(
  projectName: string,
  objective: string,
  config: Partial<RoseConfig> = {}
) {
  const persistence = new Persistence();
  const existingState = await persistence.loadState();

  const orchestrator = new Orchestrator(
    projectName,
    objective,
    config,
    {
      onStateChange: (state, previous) => {
        console.log(`[Rose] ${previous} -> ${state}`);
      },
      onProgress: (message) => {
        console.log(`[Rose] ${message}`);
      },
      onError: (error) => {
        console.error(`[Rose] Error:`, error.message);
      },
      onRecovery: (checkpointId, reason) => {
        console.log(`[Rose] RECOVERY: ${checkpointId} - ${reason}`);
      },
      onAgentHealth: (status, score) => {
        console.log(`[Rose] Agent Health: ${status} (${score}/100)`);
      },
    }
  );

  return {
    orchestrator,
    persistence,
    async start() {
      await orchestrator.start();
      const state = orchestrator.projectState;
      await persistence.saveState(state);
    },
    async stop() {
      orchestrator.stop();
      const state = orchestrator.projectState;
      await persistence.saveState(state);
    },
    async getState() {
      return orchestrator.projectState;
    },
  };
}
