const TRANSITIONS = [
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
    current = "IDLE";
    history = [];
    listeners = new Map();
    get state() {
        return this.current;
    }
    get stateHistory() {
        return [...this.history];
    }
    canTransition(to) {
        return TRANSITIONS.some((t) => t.from.includes(this.current) && t.to === to);
    }
    transition(to) {
        if (!this.canTransition(to)) {
            throw new Error(`Invalid transition: ${this.current} -> ${to}. ` +
                `Valid transitions: ${this.getValidTransitions().join(", ")}`);
        }
        const previous = this.current;
        this.current = to;
        this.history.push({
            state: to,
            timestamp: new Date().toISOString(),
        });
        this.notifyListeners(previous, to);
    }
    getValidTransitions() {
        return TRANSITIONS
            .filter((t) => t.from.includes(this.current))
            .map((t) => t.to);
    }
    onTransition(from, callback) {
        this.listeners.set(from, callback);
    }
    notifyListeners(previous, current) {
        for (const [fromStates, callback] of this.listeners) {
            if (fromStates.includes(previous)) {
                callback(current);
            }
        }
    }
    reset() {
        this.current = "IDLE";
        this.history = [];
    }
    isTerminal() {
        return ["COMPLETED", "FAILED", "TIMEOUT"].includes(this.current);
    }
    isError() {
        return ["BLOCKED", "FAILED", "TIMEOUT"].includes(this.current);
    }
}
//# sourceMappingURL=state-machine.js.map