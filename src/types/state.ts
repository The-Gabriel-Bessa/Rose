export type RoseState =
  | "IDLE"
  | "ANALYZING"
  | "PLANNING"
  | "IMPLEMENTING"
  | "BUILDING"
  | "TESTING"
  | "INSPECTING"
  | "BUG_FOUND"
  | "FIXING"
  | "RETESTING"
  | "IMPROVING"
  | "IMPROVEMENT_SCAN"
  | "FINAL_VALIDATION"
  | "CODE_REVIEW"
  | "COMPLETED"
  | "BLOCKED"
  | "FAILED"
  | "TIMEOUT"
  | "USER_REQUIRED";

export interface RoseConfig {
  maxIterations: number;
  maxFixAttempts: number;
  timeoutPerTask: number;
  timeoutPerTest: number;
  maxRepeatedFailure: number;
  openCodeHostname: string;
  openCodePort: number;
}

export const DEFAULT_CONFIG: RoseConfig = {
  maxIterations: 20,
  maxFixAttempts: 5,
  timeoutPerTask: 300000,
  timeoutPerTest: 60000,
  maxRepeatedFailure: 3,
  openCodeHostname: "127.0.0.1",
  openCodePort: 4096,
};
