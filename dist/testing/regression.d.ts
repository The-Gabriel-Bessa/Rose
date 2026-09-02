import type { Bug, TestStatus } from "../types/project.js";
export interface RegressionTest {
    id: string;
    bugId: string;
    title: string;
    description: string;
    testFn: () => Promise<{
        passed: boolean;
        actual?: string;
        error?: string;
    }>;
    createdAt: string;
    lastRun?: string;
    lastStatus?: TestStatus;
    runCount: number;
    failureCount: number;
}
export interface RegressionSuite {
    id: string;
    name: string;
    tests: RegressionTest[];
    createdAt: string;
    lastRun?: string;
    totalRuns: number;
    totalFailures: number;
}
export interface RegressionResult {
    suiteId: string;
    timestamp: string;
    totalTests: number;
    passed: number;
    failed: number;
    regressions: RegressionTest[];
    newFailures: RegressionTest[];
    fixedIssues: RegressionTest[];
    duration: number;
}
export declare class RegressionManager {
    private suites;
    private results;
    createSuite(name: string): RegressionSuite;
    addRegressionTest(suiteId: string, bug: Bug, testFn: () => Promise<{
        passed: boolean;
        actual?: string;
        error?: string;
    }>): RegressionTest;
    runSuite(suiteId: string): Promise<RegressionResult>;
    runAllSuites(): Promise<RegressionResult[]>;
    getRegressionSummary(): {
        totalSuites: number;
        totalTests: number;
        totalRuns: number;
        totalFailures: number;
        activeRegressions: RegressionTest[];
    };
    getTestsForBug(bugId: string): RegressionTest[];
    getResultsHistory(): RegressionResult[];
    getLastResult(suiteId: string): RegressionResult | undefined;
}
//# sourceMappingURL=regression.d.ts.map