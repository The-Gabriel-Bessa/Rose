import { Orchestrator } from "./core/orchestrator.js";
import { Persistence } from "./persistence/storage.js";
export { Orchestrator } from "./core/orchestrator.js";
export { StateMachine } from "./core/state-machine.js";
export { ProjectMemory } from "./core/memory.js";
export { Persistence } from "./persistence/storage.js";
export { RoseClient, SessionManager } from "./opencode-adapter/index.js";
export { UserSimulator, TestRunner, RegressionManager } from "./testing/index.js";
export { CodeReviewer, ImprovementEngine } from "./review/index.js";
export { RecoveryManager, StateVerifier } from "./diagnostics/index.js";
export async function createRose(projectName, objective, config = {}) {
    const persistence = new Persistence();
    const existingState = await persistence.loadState();
    const orchestrator = new Orchestrator(projectName, objective, config, {
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
    });
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
//# sourceMappingURL=index.js.map