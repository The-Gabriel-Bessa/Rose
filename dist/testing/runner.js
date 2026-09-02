export class TestRunner {
    results = new Map();
    logs = new Map();
    async runTest(test, runner) {
        const startTime = Date.now();
        let status;
        let logs = [];
        try {
            const result = await runner(test);
            status = result.status;
            if (result.logs) {
                logs = [result.logs];
            }
        }
        catch (e) {
            status = "ERROR";
            logs = [`Error: ${e.message}`];
        }
        this.results.set(test.id, status);
        this.logs.set(test.id, logs);
        return { status, logs };
    }
    async runTests(tests, runner) {
        const passed = [];
        const failed = [];
        const errors = [];
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
    async runTestSuite(tests, runner, options) {
        const startTime = Date.now();
        const results = new Map();
        if (options?.parallel) {
            const maxConcurrent = options.maxConcurrent || 5;
            const chunks = [];
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
        }
        else {
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
    getResult(testId) {
        return this.results.get(testId);
    }
    getLogs(testId) {
        return this.logs.get(testId) || [];
    }
    getAllResults() {
        return new Map(this.results);
    }
    clear() {
        this.results.clear();
        this.logs.clear();
    }
}
//# sourceMappingURL=runner.js.map