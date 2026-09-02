import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
const STATE_DIR = ".rose";
const STATE_FILE = "project-state.json";
export class Persistence {
    projectRoot;
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
    }
    getStatePath() {
        return join(this.projectRoot, STATE_DIR, STATE_FILE);
    }
    async ensureDir() {
        const dir = join(this.projectRoot, STATE_DIR);
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
    }
    async saveState(state) {
        await this.ensureDir();
        const filePath = this.getStatePath();
        await writeFile(filePath, JSON.stringify(state, null, 2), "utf-8");
    }
    async loadState() {
        const filePath = this.getStatePath();
        if (!existsSync(filePath)) {
            return null;
        }
        try {
            const content = await readFile(filePath, "utf-8");
            return JSON.parse(content);
        }
        catch {
            return null;
        }
    }
    async stateExists() {
        return existsSync(this.getStatePath());
    }
    async clearState() {
        const filePath = this.getStatePath();
        if (existsSync(filePath)) {
            const { unlink } = await import("fs/promises");
            await unlink(filePath);
        }
    }
}
//# sourceMappingURL=storage.js.map