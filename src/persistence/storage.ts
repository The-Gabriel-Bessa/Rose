import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { ProjectState } from "../types/project.js";

const STATE_DIR = ".rose";
const STATE_FILE = "project-state.json";

export class Persistence {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  private getStatePath(): string {
    return join(this.projectRoot, STATE_DIR, STATE_FILE);
  }

  async ensureDir(): Promise<void> {
    const dir = join(this.projectRoot, STATE_DIR);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  async saveState(state: ProjectState): Promise<void> {
    await this.ensureDir();
    const filePath = this.getStatePath();
    await writeFile(filePath, JSON.stringify(state, null, 2), "utf-8");
  }

  async loadState(): Promise<ProjectState | null> {
    const filePath = this.getStatePath();
    if (!existsSync(filePath)) {
      return null;
    }

    try {
      const content = await readFile(filePath, "utf-8");
      return JSON.parse(content) as ProjectState;
    } catch {
      return null;
    }
  }

  async stateExists(): Promise<boolean> {
    return existsSync(this.getStatePath());
  }

  async clearState(): Promise<void> {
    const filePath = this.getStatePath();
    if (existsSync(filePath)) {
      const { unlink } = await import("fs/promises");
      await unlink(filePath);
    }
  }
}
