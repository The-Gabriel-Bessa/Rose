import type { SimulationStep } from "./types.js";

export class UserSimulator {
  private logs: string[] = [];
  private screenshots: string[] = [];

  async simulateCLI(
    commands: { command: string; args?: string[]; expected?: string }[],
    execute: (cmd: string, args?: string[]) => Promise<string>
  ): Promise<SimulationStep[]> {
    const steps: SimulationStep[] = [];

    for (let i = 0; i < commands.length; i++) {
      const { command, args, expected } = commands[i];
      const startTime = Date.now();
      let passed = false;
      let error: string | undefined;
      let output = "";

      try {
        output = await execute(command, args);
        if (expected) {
          passed = output.includes(expected);
          if (!passed) {
            error = `Expected output to contain "${expected}", got: "${output.substring(0, 200)}"`;
          }
        } else {
          passed = true;
        }
      } catch (e) {
        error = (e as Error).message;
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

  async simulateAPI(
    requests: {
      method: string;
      url: string;
      headers?: Record<string, string>;
      body?: unknown;
      expectedStatus?: number;
    }[],
    execute: (config: {
      method: string;
      url: string;
      headers?: Record<string, string>;
      body?: unknown;
    }) => Promise<{ status: number; body: unknown }>
  ): Promise<SimulationStep[]> {
    const steps: SimulationStep[] = [];

    for (let i = 0; i < requests.length; i++) {
      const req = requests[i];
      const startTime = Date.now();
      let passed = false;
      let error: string | undefined;
      let responseStatus = 0;
      let responseBody: unknown;

      try {
        const response = await execute(req);
        responseStatus = response.status;
        responseBody = response.body;

        if (req.expectedStatus) {
          passed = responseStatus === req.expectedStatus;
          if (!passed) {
            error = `Expected status ${req.expectedStatus}, got ${responseStatus}`;
          }
        } else {
          passed = responseStatus >= 200 && responseStatus < 300;
          if (!passed) {
            error = `Request failed with status ${responseStatus}`;
          }
        }
      } catch (e) {
        error = (e as Error).message;
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

  async simulateBrowserActions(
    actions: {
      type: "navigate" | "click" | "fill" | "waitFor" | "screenshot";
      selector?: string;
      value?: string;
      url?: string;
    }[],
    execute: (action: {
      type: string;
      selector?: string;
      value?: string;
      url?: string;
    }) => Promise<{ success: boolean; error?: string; screenshot?: string }>
  ): Promise<SimulationStep[]> {
    const steps: SimulationStep[] = [];

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const startTime = Date.now();
      let passed = false;
      let error: string | undefined;

      try {
        const result = await execute(action);
        passed = result.success;
        error = result.error;
        if (result.screenshot) {
          this.screenshots.push(result.screenshot);
        }
      } catch (e) {
        error = (e as Error).message;
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

  getLogs(): string[] {
    return [...this.logs];
  }

  getScreenshots(): string[] {
    return [...this.screenshots];
  }

  clear(): void {
    this.logs = [];
    this.screenshots = [];
  }
}
