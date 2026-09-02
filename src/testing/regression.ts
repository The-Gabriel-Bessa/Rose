import type { Bug, TestCase, TestStatus } from "../types/project.js";

export interface RegressionTest {
  id: string;
  bugId: string;
  title: string;
  description: string;
  testFn: () => Promise<{ passed: boolean; actual?: string; error?: string }>;
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

export class RegressionManager {
  private suites: Map<string, RegressionSuite> = new Map();
  private results: RegressionResult[] = [];

  createSuite(name: string): RegressionSuite {
    const suite: RegressionSuite = {
      id: `REG-SUITE-${String(this.suites.size + 1).padStart(3, "0")}`,
      name,
      tests: [],
      createdAt: new Date().toISOString(),
      totalRuns: 0,
      totalFailures: 0,
    };
    this.suites.set(suite.id, suite);
    return suite;
  }

  addRegressionTest(
    suiteId: string,
    bug: Bug,
    testFn: () => Promise<{ passed: boolean; actual?: string; error?: string }>
  ): RegressionTest {
    const suite = this.suites.get(suiteId);
    if (!suite) {
      throw new Error(`Suite ${suiteId} not found`);
    }

    const test: RegressionTest = {
      id: `REG-${String(suite.tests.length + 1).padStart(3, "0")}`,
      bugId: bug.id,
      title: `Regression test for ${bug.title}`,
      description: `Verifies that ${bug.title} does not reoccur`,
      testFn,
      createdAt: new Date().toISOString(),
      runCount: 0,
      failureCount: 0,
    };

    suite.tests.push(test);
    return test;
  }

  async runSuite(suiteId: string): Promise<RegressionResult> {
    const suite = this.suites.get(suiteId);
    if (!suite) {
      throw new Error(`Suite ${suiteId} not found`);
    }

    const startTime = Date.now();
    const regressions: RegressionTest[] = [];
    const newFailures: RegressionTest[] = [];
    const fixedIssues: RegressionTest[] = [];
    let passed = 0;
    let failed = 0;

    for (const test of suite.tests) {
      const previousStatus = test.lastStatus;

      try {
        const result = await test.testFn();
        test.runCount++;
        test.lastRun = new Date().toISOString();

        if (result.passed) {
          test.lastStatus = "PASS";
          passed++;

          if (previousStatus === "FAIL") {
            fixedIssues.push(test);
          }
        } else {
          test.lastStatus = "FAIL";
          test.failureCount++;
          failed++;

          if (previousStatus === "PASS" || previousStatus === undefined) {
            newFailures.push(test);
          } else {
            regressions.push(test);
          }
        }
      } catch (e) {
        test.lastStatus = "ERROR";
        test.failureCount++;
        failed++;
        newFailures.push(test);
      }
    }

    suite.totalRuns++;
    suite.totalFailures += failed;
    suite.lastRun = new Date().toISOString();

    const result: RegressionResult = {
      suiteId,
      timestamp: new Date().toISOString(),
      totalTests: suite.tests.length,
      passed,
      failed,
      regressions,
      newFailures,
      fixedIssues,
      duration: Date.now() - startTime,
    };

    this.results.push(result);
    return result;
  }

  async runAllSuites(): Promise<RegressionResult[]> {
    const results: RegressionResult[] = [];

    for (const suiteId of this.suites.keys()) {
      const result = await this.runSuite(suiteId);
      results.push(result);
    }

    return results;
  }

  getRegressionSummary(): {
    totalSuites: number;
    totalTests: number;
    totalRuns: number;
    totalFailures: number;
    activeRegressions: RegressionTest[];
  } {
    let totalTests = 0;
    let totalRuns = 0;
    let totalFailures = 0;
    const activeRegressions: RegressionTest[] = [];

    for (const suite of this.suites.values()) {
      totalTests += suite.tests.length;
      totalRuns += suite.totalRuns;
      totalFailures += suite.totalFailures;

      for (const test of suite.tests) {
        if (test.lastStatus === "FAIL" || test.lastStatus === "ERROR") {
          activeRegressions.push(test);
        }
      }
    }

    return {
      totalSuites: this.suites.size,
      totalTests,
      totalRuns,
      totalFailures,
      activeRegressions,
    };
  }

  getTestsForBug(bugId: string): RegressionTest[] {
    const tests: RegressionTest[] = [];

    for (const suite of this.suites.values()) {
      for (const test of suite.tests) {
        if (test.bugId === bugId) {
          tests.push(test);
        }
      }
    }

    return tests;
  }

  getResultsHistory(): RegressionResult[] {
    return [...this.results];
  }

  getLastResult(suiteId: string): RegressionResult | undefined {
    return this.results
      .filter((r) => r.suiteId === suiteId)
      .pop();
  }
}
