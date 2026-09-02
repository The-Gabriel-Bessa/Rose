import type { SimulationStep } from "./types.js";
export declare class UserSimulator {
    private logs;
    private screenshots;
    simulateCLI(commands: {
        command: string;
        args?: string[];
        expected?: string;
    }[], execute: (cmd: string, args?: string[]) => Promise<string>): Promise<SimulationStep[]>;
    simulateAPI(requests: {
        method: string;
        url: string;
        headers?: Record<string, string>;
        body?: unknown;
        expectedStatus?: number;
    }[], execute: (config: {
        method: string;
        url: string;
        headers?: Record<string, string>;
        body?: unknown;
    }) => Promise<{
        status: number;
        body: unknown;
    }>): Promise<SimulationStep[]>;
    simulateBrowserActions(actions: {
        type: "navigate" | "click" | "fill" | "waitFor" | "screenshot";
        selector?: string;
        value?: string;
        url?: string;
    }[], execute: (action: {
        type: string;
        selector?: string;
        value?: string;
        url?: string;
    }) => Promise<{
        success: boolean;
        error?: string;
        screenshot?: string;
    }>): Promise<SimulationStep[]>;
    getLogs(): string[];
    getScreenshots(): string[];
    clear(): void;
}
//# sourceMappingURL=simulator.d.ts.map