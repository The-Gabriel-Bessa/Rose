import type { RoseConfig } from "../types/state.js";
export declare class RoseClient {
    private sdkClient;
    private baseUrl;
    constructor(config: RoseConfig);
    private getClient;
    health(): Promise<any>;
    listSessions(): Promise<import("@opencode-ai/sdk").Session[] | undefined>;
    createSession(title?: string): Promise<import("@opencode-ai/sdk").Session | undefined>;
    getSession(id: string): Promise<import("@opencode-ai/sdk").Session | undefined>;
    deleteSession(id: string): Promise<void>;
    sendMessage(sessionId: string, text: string, options?: {
        model?: {
            providerID: string;
            modelID: string;
        };
        noReply?: boolean;
        agent?: string;
    }): Promise<{
        info: import("@opencode-ai/sdk").AssistantMessage;
        parts: Array<import("@opencode-ai/sdk").Part>;
    } | undefined>;
    getMessages(sessionId: string): Promise<{
        info: import("@opencode-ai/sdk").Message;
        parts: Array<import("@opencode-ai/sdk").Part>;
    }[] | undefined>;
    abortSession(sessionId: string): Promise<void>;
    shareSession(sessionId: string): Promise<import("@opencode-ai/sdk").Session | undefined>;
    revertMessage(sessionId: string, messageId: string): Promise<void>;
    initProject(sessionId: string, providerID: string, modelID: string): Promise<void>;
    getConfig(): Promise<import("@opencode-ai/sdk").Config | undefined>;
    getProviders(): Promise<{
        providers: Array<import("@opencode-ai/sdk").Provider>;
        default: {
            [key: string]: string;
        };
    } | undefined>;
    searchFiles(pattern: string): Promise<{
        path: {
            text: string;
        };
        lines: {
            text: string;
        };
        line_number: number;
        absolute_offset: number;
        submatches: Array<{
            match: {
                text: string;
            };
            start: number;
            end: number;
        }>;
    }[] | undefined>;
    findFiles(query: string): Promise<string[] | undefined>;
    readFile(path: string): Promise<import("@opencode-ai/sdk").FileContent | undefined>;
    listAgents(): Promise<import("@opencode-ai/sdk").Agent[] | undefined>;
    executeCommand(sessionId: string, command: string, args?: string[]): Promise<{
        info: import("@opencode-ai/sdk").AssistantMessage;
        parts: Array<import("@opencode-ai/sdk").Part>;
    } | undefined>;
    runShell(sessionId: string, command: string): Promise<string>;
}
//# sourceMappingURL=client.d.ts.map