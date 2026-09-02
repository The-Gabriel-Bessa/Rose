import type { TestCase, TestStatus } from "../types/project.js";

export class TestRunner {
  private results: Map<string, TestStatus> = new Map();
  private logs: Map<string, string[]> = new Map();

  async runTest(
    test: TestCase,
    runner: (test: TestCase) => Promise<{ status: TestStatus; logs?: string }>
  ): Promise<{ status: TestStatus; logs: string[] }> {
    const startTime = Date.now();
    let status: TestStatus;
    let logs: string[] = [];

    try {
      const result = await runner(test);
      status = result.status;
      if (result.logs) {
        logs = [result.logs];
      }
    } catch (e) {
      status = "ERROR";
      logs = [`Error: ${(e as Error).message}`];
    }

    this.results.set(test.id, status);
    this.logs.set(test.id, logs);

    return { status, logs };
  }

  async runTests(
    tests: TestCase[],
    runner: (test: TestCase) => Promise<{ status: TestStatus; logs?: string }>
  ): Promise<{ passed: string[]; failed: string[]; errors: string[] }> {
    const passed: string[] = [];
    const failed: string[] = [];
    const errors: string[] = [];

    for (const test of tests) {
      const result = await this.runTest(test, runner);

      switch (result.status) {
        case "PASS":
          passed.push(test.id);
          break;
        case "FAIL":
          failed.push(test.id);
          break;
        case "ERROR":
          errors.push(test.id);
          break;
        default:
          break;
      }
    }

    return { passed, failed, errors };
  }

  async runTestSuite(
    tests: TestCase[],
    runner: (test: TestCase) => Promise<{ status: TestStatus; logs?: string }>,
    options?: { parallel?: boolean; maxConcurrent?: number }
  ): Promise<{
    total: number;
    passed: number;
    failed: number;
    errors: number;
    duration: number;
    results: Map<string, { status: TestStatus; logs: string[] }>;
  }> {
    const startTime = Date.now();
    const results = new Map<string, { status: TestStatus; logs: string[] }>();

    if (options?.parallel) {
      const maxConcurrent = options.maxConcurrent || 5;
      const chunks: TestCase[][] = [];

      for (let i = 0; i < tests.length; i += maxConcurrent) {
        chunks.push(tests.slice(i, i + maxConcurrent));
      }

      for (const chunk of chunks) {
        const promises = chunk.map(async (test) => {
          const result = await this.runTest(test, runner);
          results.set(test.id, result);
          return { testId: test.id, ...result };
        });

        await Promise.all(promises);
      }
    } else {
      for (const test of tests) {
        const result = await this.runTest(test, runner);
        results.set(test.id, result);
      }
    }

    let passed = 0;
    let failed = 0;
    let errors = 0;

    for (const { status } of results.values()) {
      switch (status) {
        case "PASS":
          passed++;
          break;
        case "FAIL":
          failed++;
          break;
        case "ERROR":
          errors++;
          break;
      }
    }

    return {
      total: tests.length,
      passed,
      failed,
      errors,
      duration: Date.now() - startTime,
      results,
    };
  }

  getResult(testId: string): TestStatus | undefined {
    return this.results.get(testId);
  }

  getLogs(testId: string): string[] {
    return this.logs.get(testId) || [];
  }

  getAllResults(): Map<string, TestStatus> {
    return new Map(this.results);
  }

  clear(): void {
    this.results.clear();
    this.logs.clear();
  }
}
