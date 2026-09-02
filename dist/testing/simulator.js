export class UserSimulator {
    logs = [];
    screenshots = [];
    async simulateCLI(commands, execute) {
        const steps = [];
        for (let i = 0; i < commands.length; i++) {
            const { command, args, expected } = commands[i];
            const startTime = Date.now();
            let passed = false;
            let error;
            let output = "";
            try {
                output = await execute(command, args);
                if (expected) {
                    passed = output.includes(expected);
                    if (!passed) {
                        error = `Expected output to contain "${expected}", got: "${output.substring(0, 200)}"`;
                    }
                }
                else {
                    passed = true;
                }
            }
            catch (e) {
                error = e.message;
                passed = false;
            }
            steps.push({
                id: `CLI-${String(i + 1).padStart(3, "0")}`,
                action: `${command} ${(args || []).join(" ")}`.trim(),
                expected,
                actual: output,
                passed,
                error,
                logs: [output],
                duration: Date.now() - startTime,
            });
            this.logs.push(`[${passed ? "PASS" : "FAIL"}] ${command}: ${error || "OK"}`);
        }
        return steps;
    }
    async simulateAPI(requests, execute) {
        const steps = [];
        for (let i = 0; i < requests.length; i++) {
            const req = requests[i];
            const startTime = Date.now();
            let passed = false;
            let error;
            let responseStatus = 0;
            let responseBody;
            try {
                const response = await execute(req);
                responseStatus = response.status;
                responseBody = response.body;
                if (req.expectedStatus) {
                    passed = responseStatus === req.expectedStatus;
                    if (!passed) {
                        error = `Expected status ${req.expectedStatus}, got ${responseStatus}`;
                    }
                }
                else {
                    passed = responseStatus >= 200 && responseStatus < 300;
                    if (!passed) {
                        error = `Request failed with status ${responseStatus}`;
                    }
                }
            }
            catch (e) {
                error = e.message;
                passed = false;
            }
            steps.push({
                id: `API-${String(i + 1).padStart(3, "0")}`,
                action: `${req.method} ${req.url}`,
                expected: req.expectedStatus ? `Status ${req.expectedStatus}` : "2xx",
                actual: `Status ${responseStatus}`,
                passed,
                error,
                logs: [`Response: ${JSON.stringify(responseBody).substring(0, 500)}`],
                duration: Date.now() - startTime,
            });
            this.logs.push(`[${passed ? "PASS" : "FAIL"}] ${req.method} ${req.url}: ${error || "OK"}`);
        }
        return steps;
    }
    async simulateBrowserActions(actions, execute) {
        const steps = [];
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            const startTime = Date.now();
            let passed = false;
            let error;
            try {
                const result = await execute(action);
                passed = result.success;
                error = result.error;
                if (result.screenshot) {
                    this.screenshots.push(result.screenshot);
                }
            }
            catch (e) {
                error = e.message;
                passed = false;
            }
            steps.push({
                id: `BROWSER-${String(i + 1).padStart(3, "0")}`,
                action: `${action.type}${action.selector ? ` on ${action.selector}` : ""}${action.url ? ` to ${action.url}` : ""}`,
                passed,
                error,
                logs: [],
                duration: Date.now() - startTime,
            });
            this.logs.push(`[${passed ? "PASS" : "FAIL"}] ${action.type}: ${error || "OK"}`);
        }
        return steps;
    }
    getLogs() {
        return [...this.logs];
    }
    getScreenshots() {
        return [...this.screenshots];
    }
    clear() {
        this.logs = [];
        this.screenshots = [];
    }
}
//# sourceMappingURL=simulator.js.map