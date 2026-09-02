export type AppType = "cli" | "web" | "desktop" | "api";

export interface UserSimulationConfig {
  appType: AppType;
  baseUrl?: string;
  entryPoint?: string;
  timeout: number;
  retries: number;
}

export interface SimulationStep {
  id: string;
  action: string;
  target?: string;
  input?: string;
  expected?: string;
  actual?: string;
  screenshot?: string;
  logs?: string[];
  passed: boolean;
  error?: string;
  duration: number;
}

export interface SimulationResult {
  id: string;
  appType: AppType;
  steps: SimulationStep[];
  passed: number;
  failed: number;
  errors: string[];
  duration: number;
  screenshots: string[];
  logs: string[];
  timestamp: string;
}

export interface BrowserConfig {
  headless: boolean;
  viewport: { width: number; height: number };
  userAgent?: string;
  slowMo?: number;
}

export interface APIRequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  expectedStatus?: number;
  expectedBody?: unknown;
}

export interface CLICommandConfig {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  expectedExitCode?: number;
  expectedOutput?: string;
}
