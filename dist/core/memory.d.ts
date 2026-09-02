import type { ProjectState, Requirement, TestCase, Bug, Task, Iteration } from "../types/project.js";
export declare class ProjectMemory {
    private state;
    constructor(projectName: string, objective: string);
    getState(): ProjectState;
    addRequirement(description: string): Requirement;
    addTest(test: Omit<TestCase, "id" | "createdAt" | "updatedAt">): TestCase;
    addBug(bug: Omit<Bug, "id" | "createdAt" | "updatedAt" | "fixAttempts">): Bug;
    updateBug(bugId: string, updates: Partial<Bug>): void;
    addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Task;
    updateTask(taskId: string, updates: Partial<Task>): void;
    startIteration(): Iteration;
    completeIteration(): void;
    addDecision(decision: string): void;
    updateState(state: string): void;
    getRequirementStats(): {
        total: number;
        validated: number;
        percentage: number;
    };
    getTestStats(): {
        total: number;
        passed: number;
        failed: number;
        notRun: number;
    };
    getBugStats(): {
        total: number;
        open: number;
        fixed: number;
    };
    private touch;
}
//# sourceMappingURL=memory.d.ts.map