import type { TestCase, TestStatus } from "../types/project.js";
export declare class TestRunner {
    private results;
    private logs;
    runTest(test: TestCase, runner: (test: TestCase) => Promise<{
        status: TestStatus;
        logs?: string;
    }>): Promise<{
        status: TestStatus;
        logs: string[];
    }>;
    runTests(tests: TestCase[], runner: (test: TestCase) => Promise<{
        status: TestStatus;
        logs?: string;
    }>): Promise<{
        passed: string[];
        failed: string[];
        errors: string[];
    }>;
    runTestSuite(tests: TestCase[], runner: (test: TestCase) => Promise<{
        status: TestStatus;
        logs?: string;
    }>, options?: {
        parallel?: boolean;
        maxConcurrent?: number;
    }): Promise<{
        total: number;
        passed: number;
        failed: number;
        errors: number;
        duration: number;
        results: Map<string, {
            status: TestStatus;
            logs: string[];
        }>;
    }>;
    getResult(testId: string): TestStatus | undefined;
    getLogs(testId: string): string[];
    getAllResults(): Map<string, TestStatus>;
    clear(): void;
}
//# sourceMappingURL=runner.d.ts.map