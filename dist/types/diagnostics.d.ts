export interface Diagnosis {
    bugId: string;
    requirement: string;
    test: string;
    expected: string;
    actual: string;
    reproduction: string[];
    logs: string;
    rootCause?: string;
    suggestedFix?: string;
}
export interface QualityScore {
    requirements: number;
    tests: number;
    codeQuality: number;
    architecture: number;
    errorHandling: number;
    ux: number;
    overall: number;
}
export interface ReviewResult {
    score: QualityScore;
    issues: ReviewIssue[];
    recommendations: string[];
    regressions: string[];
}
export interface ReviewIssue {
    severity: "critical" | "high" | "medium" | "low";
    category: "correctness" | "architecture" | "maintainability" | "security" | "performance" | "error-handling" | "testing" | "ux" | "requirements";
    description: string;
    file?: string;
    line?: number;
    suggestion?: string;
}
export interface ImprovementSuggestion {
    id: string;
    category: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    affectedFiles: string[];
    applied: boolean;
}
//# sourceMappingURL=diagnostics.d.ts.map