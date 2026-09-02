export type ImprovementCategory = "code-duplication" | "unhandled-errors" | "missing-tests" | "partial-implementation" | "critical-todos" | "broken-dependencies" | "performance" | "ux" | "requirements-inconsistency" | "regression-risk" | "security" | "maintainability";
export type ImprovementPriority = "high" | "medium" | "low";
export interface Improvement {
    id: string;
    category: ImprovementCategory;
    priority: ImprovementPriority;
    title: string;
    description: string;
    affectedFiles: string[];
    suggestion: string;
    applied: boolean;
    appliedAt?: string;
    appliedBy?: string;
}
export interface ImprovementScanResult {
    id: string;
    timestamp: string;
    improvements: Improvement[];
    summary: {
        total: number;
        high: number;
        medium: number;
        low: number;
        applied: number;
        pending: number;
    };
    scanDuration: number;
}
export interface ImprovementConfig {
    categories: ImprovementCategory[];
    autoApply: boolean;
    minPriority: ImprovementPriority;
    maxImprovements: number;
}
export declare class ImprovementEngine {
    private config;
    private improvements;
    private scanCount;
    constructor(config?: Partial<ImprovementConfig>);
    scan(files: {
        path: string;
        content: string;
    }[], scanner: (files: {
        path: string;
        content: string;
    }[]) => Promise<Improvement[]>): Promise<ImprovementScanResult>;
    scanWithPrompt(files: {
        path: string;
        content: string;
    }[], promptBuilder: (files: {
        path: string;
        content: string;
    }[]) => string, responseParser: (response: string) => Improvement[]): Promise<ImprovementScanResult>;
    applyImprovement(improvementId: string): void;
    applyAll(): Improvement[];
    getImprovements(): Improvement[];
    getPendingImprovements(): Improvement[];
    getAppliedImprovements(): Improvement[];
    getImprovementsByCategory(category: ImprovementCategory): Improvement[];
    getImprovementsByPriority(priority: ImprovementPriority): Improvement[];
    getSummary(): {
        total: number;
        applied: number;
        pending: number;
        byCategory: Record<ImprovementCategory, number>;
        byPriority: Record<ImprovementPriority, number>;
    };
    private calculateSummary;
    private getPriorityWeight;
    generateReport(): string;
}
//# sourceMappingURL=improvements.d.ts.map