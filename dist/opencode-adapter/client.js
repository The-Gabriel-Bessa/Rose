import { createOpencodeClient } from "@opencode-ai/sdk";
export class RoseClient {
    sdkClient = null;
    baseUrl;
    constructor(config) {
        this.baseUrl = `http://${config.openCodeHostname}:${config.openCodePort}`;
    }
    async getClient() {
        if (!this.sdkClient) {
            this.sdkClient = createOpencodeClient({
                baseUrl: this.baseUrl,
            });
        }
        return this.sdkClient;
    }
    async health() {
        const client = await this.getClient();
        // @ts-expect-error - SDK type inference issue
        const result = await client.global.health();
        return result.data;
    }
    async listSessions() {
        const client = await this.getClient();
        const result = await client.session.list();
        return result.data;
    }
    async createSession(title) {
        const client = await this.getClient();
        const result = await client.session.create({
            body: { title },
        });
        return result.data;
    }
    async getSession(id) {
        const client = await this.getClient();
        const result = await client.session.get({
            path: { id },
        });
        return result.data;
    }
    async deleteSession(id) {
        const client = await this.getClient();
        await client.session.delete({
            path: { id },
        });
    }
    async sendMessage(sessionId, text, options) {
        const client = await this.getClient();
        const result = await client.session.prompt({
            path: { id: sessionId },
            body: {
                parts: [{ type: "text", text }],
                ...(options?.model && { model: options.model }),
                ...(options?.noReply && { noReply: true }),
                ...(options?.agent && { agent: options.agent }),
            },
        });
        return result.data;
    }
    async getMessages(sessionId) {
        const client = await this.getClient();
        const result = await client.session.messages({
            path: { id: sessionId },
        });
        return result.data;
    }
    async abortSession(sessionId) {
        const client = await this.getClient();
        await client.session.abort({
            path: { id: sessionId },
        });
    }
    async shareSession(sessionId) {
        const client = await this.getClient();
        const result = await client.session.share({
            path: { id: sessionId },
        });
        return result.data;
    }
    async revertMessage(sessionId, messageId) {
        const client = await this.getClient();
        await client.session.revert({
            path: { id: sessionId },
            body: { messageID: messageId },
        });
    }
    async initProject(sessionId, providerID, modelID) {
        const client = await this.getClient();
        await client.session.init({
            path: { id: sessionId },
            body: { providerID, modelID, messageID: "" },
        });
    }
    async getConfig() {
        const client = await this.getClient();
        const result = await client.config.get();
        return result.data;
    }
    async getProviders() {
        const client = await this.getClient();
        const result = await client.config.providers();
        return result.data;
    }
    async searchFiles(pattern) {
        const client = await this.getClient();
        const result = await client.find.text({
            query: { pattern },
        });
        return result.data;
    }
    async findFiles(query) {
        const client = await this.getClient();
        const result = await client.find.files({
            query: { query },
        });
        return result.data;
    }
    async readFile(path) {
        const client = await this.getClient();
        const result = await client.file.read({
            query: { path },
        });
        return result.data;
    }
    async listAgents() {
        const client = await this.getClient();
        const result = await client.app.agents();
        return result.data;
    }
    async executeCommand(sessionId, command, args) {
        const client = await this.getClient();
        const result = await client.session.command({
            path: { id: sessionId },
            body: {
                command,
                arguments: (args || []).join(" "),
            },
        });
        return result.data;
    }
    async runShell(sessionId, command) {
        const client = await this.getClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await client.session.shell({
            path: { id: sessionId },
            body: {
                agent: "build",
                command,
            },
        });
        const data = result.data;
        if (typeof data === "string") {
            return data;
        }
        if (Array.isArray(data)) {
            return data.join("\n");
        }
        if (data && typeof data === "object") {
            return JSON.stringify(data);
        }
        return String(data || "");
    }
}
//# sourceMappingURL=client.js.map