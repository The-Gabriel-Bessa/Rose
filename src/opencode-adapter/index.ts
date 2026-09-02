import { RoseClient } from "./client.js";
import { SessionManager } from "./session-manager.js";
import type { RoseConfig } from "../types/state.js";

export { RoseClient } from "./client.js";
export { SessionManager } from "./session-manager.js";

export function createOpenCodeAdapter(config: RoseConfig) {
  const client = new RoseClient(config);
  const sessionManager = new SessionManager(client);

  return {
    client,
    sessionManager,
  };
}
