import { RoseClient } from "./client.js";

export class SessionManager {
  private client: RoseClient;
  private activeSessionId: string | null = null;
  private sessionHistory: string[] = [];

  constructor(client: RoseClient) {
    this.client = client;
  }

  get activeSession(): string | null {
    return this.activeSessionId;
  }

  async createNewSession(title: string): Promise<string> {
    const session = await this.client.createSession(title);
    if (!session || !session.id) {
      throw new Error("Failed to create session");
    }
    this.activeSessionId = session.id;
    this.sessionHistory.push(session.id);
    return session.id;
  }

  async continueSession(sessionId: string): Promise<void> {
    const session = await this.client.getSession(sessionId);
    if (session) {
      this.activeSessionId = sessionId;
    }
  }

  async sendTask(taskDescription: string): Promise<string> {
    if (!this.activeSessionId) {
      throw new Error("No active session. Create or continue a session first.");
    }

    const result = await this.client.sendMessage(this.activeSessionId, taskDescription);
    return JSON.stringify(result);
  }

  async sendTaskWithContext(taskDescription: string, context: string): Promise<string> {
    if (!this.activeSessionId) {
      throw new Error("No active session. Create or continue a session first.");
    }

    const fullPrompt = `${taskDescription}\n\nContext:\n${context}`;
    const result = await this.client.sendMessage(this.activeSessionId, fullPrompt);
    return JSON.stringify(result);
  }

  async getConversationHistory(): Promise<string> {
    if (!this.activeSessionId) {
      return "";
    }

    const messages = await this.client.getMessages(this.activeSessionId);
    return JSON.stringify(messages, null, 2);
  }

  async abortCurrentTask(): Promise<void> {
    if (this.activeSessionId) {
      await this.client.abortSession(this.activeSessionId);
    }
  }

  async summarizeSession(): Promise<string> {
    if (!this.activeSessionId) {
      return "";
    }

    const history = await this.getConversationHistory();
    return `Session ${this.activeSessionId} summary:\n${history.substring(0, 2000)}...`;
  }

  async startNewSessionAfterContextFull(reason: string): Promise<string> {
    const summary = await this.summarizeSession();
    const newSessionId = await this.createNewSession(`Continuation: ${reason}`);

    await this.client.sendMessage(
      newSessionId,
      `Previous session summary:\n${summary}\n\nContinuing work on: ${reason}`
    );

    return newSessionId;
  }

  getSessionHistory(): string[] {
    return [...this.sessionHistory];
  }
}
