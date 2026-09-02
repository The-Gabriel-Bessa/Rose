import { RoseClient } from "./client.js";
export declare class SessionManager {
    private client;
    private activeSessionId;
    private sessionHistory;
    constructor(client: RoseClient);
    get activeSession(): string | null;
    createNewSession(title: string): Promise<string>;
    continueSession(sessionId: string): Promise<void>;
    sendTask(taskDescription: string): Promise<string>;
    sendTaskWithContext(taskDescription: string, context: string): Promise<string>;
    getConversationHistory(): Promise<string>;
    abortCurrentTask(): Promise<void>;
    summarizeSession(): Promise<string>;
    startNewSessionAfterContextFull(reason: string): Promise<string>;
    getSessionHistory(): string[];
}
//# sourceMappingURL=session-manager.d.ts.map