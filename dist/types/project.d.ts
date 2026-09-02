export type RequirementStatus = "IDENTIFIED" | "IN_PROGRESS" | "IMPLEMENTED" | "TESTED" | "VALIDATED";
export interface Requirement {
    id: string;
    description: string;
    status: RequirementStatus;
    testIds: string[];
    bugIds: string[];
    notes: string[];
    createdAt: string;
    updatedAt: string;
}
export type TestStatus = "NOT_RUN" | "PASS" | "FAIL" | "ERROR" | "SKIP";
export interface TestCase {
    id: string;
    requirementId: string;
    title: string;
    description: string;
    steps: string[];
    expected: string;
    actual?: string;
    status: TestStatus;
    type: "unit" | "integration" | "e2e" | "manual";
    logs?: string;
    createdAt: string;
    updatedAt: string;
}
export type BugSeverity = "critical" | "high" | "medium" | "low";
export type BugStatus = "OPEN" | "IN_PROGRESS" | "FIXED" | "VERIFIED" | "WONT_FIX";
export interface Bug {
    id: string;
    severity: BugSeverity;
    title: string;
    description: string;
    requirementId: string;
    testId: string;
    steps: string[];
    expected: string;
    actual: string;
    logs?: string;
    screenshots: string[];
    reproduction: "reproducible" | "intermittent" | "unknown";
    status: BugStatus;
    fixAttempts: number;
    regressionTestId?: string;
    createdAt: string;
    updatedAt: string;
}
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "BLOCKED";
export interface Task {
    id: string;
    title: string;
    description: string;
    requirementId?: string;
    status: TaskStatus;
    dependencies: string[];
    result?: string;
    error?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Iteration {
    number: number;
    startedAt: string;
    completedAt?: string;
    state: string;
    tasksCompleted: number;
    tasksFailed: number;
    bugsFound: number;
    bugsFixed: number;
    testsPassed: number;
    testsFailed: number;
    notes: string[];
}
export interface ProjectState {
    projectName: string;
    objective: string;
    requirements: Requirement[];
    tests: TestCase[];
    bugs: Bug[];
    tasks: Task[];
    iterations: Iteration[];
    currentIteration: number;
    currentTaskIndex: number;
    state: string;
    startedAt: string;
    updatedAt: string;
    completedAt?: string;
    totalAttempts: number;
    decisions: string[];
}
//# sourceMappingURL=project.d.ts.map