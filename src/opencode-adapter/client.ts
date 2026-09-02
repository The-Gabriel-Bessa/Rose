import { createOpencodeClient, type OpencodeClient } from "@opencode-ai/sdk";
import type { RoseConfig } from "../types/state.js";

export class RoseClient {
  private sdkClient: OpencodeClient | null = null;
  private baseUrl: string;

  constructor(config: RoseConfig) {
    this.baseUrl = `http://${config.openCodeHostname}:${config.openCodePort}`;
  }

  private async getClient(): Promise<OpencodeClient> {
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

  async createSession(title?: string) {
    const client = await this.getClient();
    const result = await client.session.create({
      body: { title },
    });
    return result.data;
  }

  async getSession(id: string) {
    const client = await this.getClient();
    const result = await client.session.get({
      path: { id },
    });
    return result.data;
  }

  async deleteSession(id: string) {
    const client = await this.getClient();
    await client.session.delete({
      path: { id },
    });
  }

  async sendMessage(sessionId: string, text: string, options?: {
    model?: { providerID: string; modelID: string };
    noReply?: boolean;
    agent?: string;
  }) {
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

  async getMessages(sessionId: string) {
    const client = await this.getClient();
    const result = await client.session.messages({
      path: { id: sessionId },
    });
    return result.data;
  }

  async abortSession(sessionId: string) {
    const client = await this.getClient();
    await client.session.abort({
      path: { id: sessionId },
    });
  }

  async shareSession(sessionId: string) {
    const client = await this.getClient();
    const result = await client.session.share({
      path: { id: sessionId },
    });
    return result.data;
  }

  async revertMessage(sessionId: string, messageId: string) {
    const client = await this.getClient();
    await client.session.revert({
      path: { id: sessionId },
      body: { messageID: messageId },
    });
  }

  async initProject(sessionId: string, providerID: string, modelID: string) {
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

  async searchFiles(pattern: string) {
    const client = await this.getClient();
    const result = await client.find.text({
      query: { pattern },
    });
    return result.data;
  }

  async findFiles(query: string) {
    const client = await this.getClient();
    const result = await client.find.files({
      query: { query },
    });
    return result.data;
  }

  async readFile(path: string) {
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

  async executeCommand(sessionId: string, command: string, args?: string[]) {
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

  async runShell(sessionId: string, command: string): Promise<string> {
    const client = await this.getClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await client.session.shell({
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
