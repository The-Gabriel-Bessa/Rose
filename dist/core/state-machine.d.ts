import type { RoseState } from "../types/state.js";
export declare class StateMachine {
    private current;
    private history;
    private listeners;
    get state(): RoseState;
    get stateHistory(): {
        state: RoseState;
        timestamp: string;
    }[];
    canTransition(to: RoseState): boolean;
    transition(to: RoseState): void;
    getValidTransitions(): RoseState[];
    onTransition(from: RoseState[], callback: (state: RoseState) => void): void;
    private notifyListeners;
    reset(): void;
    isTerminal(): boolean;
    isError(): boolean;
}
//# sourceMappingURL=state-machine.d.ts.map