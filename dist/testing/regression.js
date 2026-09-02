export class RegressionManager {
    suites = new Map();
    results = [];
    createSuite(name) {
        const suite = {
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
    addRegressionTest(suiteId, bug, testFn) {
        const suite = this.suites.get(suiteId);
        if (!suite) {
            throw new Error(`Suite ${suiteId} not found`);
        }
        const test = {
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
    async runSuite(suiteId) {
        const suite = this.suites.get(suiteId);
        if (!suite) {
            throw new Error(`Suite ${suiteId} not found`);
        }
        const startTime = Date.now();
        const regressions = [];
        const newFailures = [];
        const fixedIssues = [];
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
                }
                else {
                    test.lastStatus = "FAIL";
                    test.failureCount++;
                    failed++;
                    if (previousStatus === "PASS" || previousStatus === undefined) {
                        newFailures.push(test);
                    }
                    else {
                        regressions.push(test);
                    }
                }
            }
            catch (e) {
                test.lastStatus = "ERROR";
                test.failureCount++;
                failed++;
                newFailures.push(test);
            }
        }
        suite.totalRuns++;
        suite.totalFailures += failed;
        suite.lastRun = new Date().toISOString();
        const result = {
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
    async runAllSuites() {
        const results = [];
        for (const suiteId of this.suites.keys()) {
            const result = await this.runSuite(suiteId);
            results.push(result);
        }
        return results;
    }
    getRegressionSummary() {
        let totalTests = 0;
        let totalRuns = 0;
        let totalFailures = 0;
        const activeRegressions = [];
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
    getTestsForBug(bugId) {
        const tests = [];
        for (const suite of this.suites.values()) {
            for (const test of suite.tests) {
                if (test.bugId === bugId) {
                    tests.push(test);
                }
            }
        }
        return tests;
    }
    getResultsHistory() {
        return [...this.results];
    }
    getLastResult(suiteId) {
        return this.results
            .filter((r) => r.suiteId === suiteId)
            .pop();
    }
}
//# sourceMappingURL=regression.js.map