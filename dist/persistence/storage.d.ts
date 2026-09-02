import type { ProjectState } from "../types/project.js";
export declare class Persistence {
    private projectRoot;
    constructor(projectRoot?: string);
    private getStatePath;
    ensureDir(): Promise<void>;
    saveState(state: ProjectState): Promise<void>;
    loadState(): Promise<ProjectState | null>;
    stateExists(): Promise<boolean>;
    clearState(): Promise<void>;
}
//# sourceMappingURL=storage.d.ts.map