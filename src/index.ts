import { Orchestrator } from "./core/orchestrator.js";
import { Persistence } from "./persistence/storage.js";
import type { RoseConfig } from "./types/state.js";

export { Orchestrator } from "./core/orchestrator.js";
export { StateMachine } from "./core/state-machine.js";
export { ProjectMemory } from "./core/memory.js";
export { Persistence } from "./persistence/storage.js";
export { RoseClient, SessionManager } from "./opencode-adapter/index.js";
export type { RoseConfig, RoseState } from "./types/state.js";
export type { ProjectState, Requirement, TestCase, Bug, Task } from "./types/project.js";

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
