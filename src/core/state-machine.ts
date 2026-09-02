import type { RoseState } from "../types/state.js";

type StateTransition = {
  from: RoseState[];
  to: RoseState;
  guard?: () => boolean;
};

const TRANSITIONS: StateTransition[] = [
  { from: ["IDLE"], to: "ANALYZING" },
  { from: ["ANALYZING"], to: "PLANNING" },
  { from: ["PLANNING"], to: "IMPLEMENTING" },
  { from: ["IMPLEMENTING"], to: "BUILDING" },
  { from: ["BUILDING"], to: "TESTING" },
  { from: ["BUILDING"], to: "FAILED", guard: () => false },
  { from: ["TESTING"], to: "INSPECTING" },
  { from: ["TESTING"], to: "BUG_FOUND" },
  { from: ["INSPECTING"], to: "IMPROVEMENT_SCAN" },
  { from: ["INSPECTING"], to: "FINAL_VALIDATION" },
  { from: ["BUG_FOUND"], to: "FIXING" },
  { from: ["FIXING"], to: "RETESTING" },
  { from: ["RETESTING"], to: "TESTING" },
  { from: ["RETESTING"], to: "FIXING" },
  { from: ["RETESTING"], to: "BLOCKED" },
  { from: ["IMPROVING"], to: "IMPLEMENTING" },
  { from: ["IMPROVEMENT_SCAN"], to: "IMPROVING" },
  { from: ["IMPROVEMENT_SCAN"], to: "FINAL_VALIDATION" },
  { from: ["FINAL_VALIDATION"], to: "CODE_REVIEW" },
  { from: ["CODE_REVIEW"], to: "COMPLETED" },
  { from: ["CODE_REVIEW"], to: "FIXING" },
  { from: ["IDLE"], to: "USER_REQUIRED" },
  { from: ["IDLE"], to: "BLOCKED" },
  { from: ["IDLE"], to: "FAILED" },
  { from: ["IDLE"], to: "TIMEOUT" },
];

export class StateMachine {
  private current: RoseState = "IDLE";
  private history: { state: RoseState; timestamp: string }[] = [];
  private listeners: Map<RoseState[], (state: RoseState) => void> = new Map();

  get state(): RoseState {
    return this.current;
  }

  get stateHistory(): { state: RoseState; timestamp: string }[] {
    return [...this.history];
  }

  canTransition(to: RoseState): boolean {
    return TRANSITIONS.some(
      (t) => t.from.includes(this.current) && t.to === to
    );
  }

  transition(to: RoseState): void {
    if (!this.canTransition(to)) {
      throw new Error(
        `Invalid transition: ${this.current} -> ${to}. ` +
        `Valid transitions: ${this.getValidTransitions().join(", ")}`
      );
    }

    const previous = this.current;
    this.current = to;
    this.history.push({
      state: to,
      timestamp: new Date().toISOString(),
    });

    this.notifyListeners(previous, to);
  }

  getValidTransitions(): RoseState[] {
    return TRANSITIONS
      .filter((t) => t.from.includes(this.current))
      .map((t) => t.to);
  }

  onTransition(from: RoseState[], callback: (state: RoseState) => void): void {
    this.listeners.set(from, callback);
  }

  private notifyListeners(previous: RoseState, current: RoseState): void {
    for (const [fromStates, callback] of this.listeners) {
      if (fromStates.includes(previous)) {
        callback(current);
      }
    }
  }

  reset(): void {
    this.current = "IDLE";
    this.history = [];
  }

  isTerminal(): boolean {
    return ["COMPLETED", "FAILED", "TIMEOUT"].includes(this.current);
  }

  isError(): boolean {
    return ["BLOCKED", "FAILED", "TIMEOUT"].includes(this.current);
  }
}
