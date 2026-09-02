import { RoseClient } from "./client.js";
import { SessionManager } from "./session-manager.js";
export { RoseClient } from "./client.js";
export { SessionManager } from "./session-manager.js";
export function createOpenCodeAdapter(config) {
    const client = new RoseClient(config);
    const sessionManager = new SessionManager(client);
    return {
        client,
        sessionManager,
    };
}
//# sourceMappingURL=index.js.map