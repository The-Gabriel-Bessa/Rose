export type ReviewCategory = "correctness" | "architecture" | "maintainability" | "security" | "performance" | "error-handling" | "testing" | "ux" | "requirements" | "regression-risk";
export type IssueSeverity = "critical" | "high" | "medium" | "low";
export interface CodeIssue {
    id: string;
    severity: IssueSeverity;
    category: ReviewCategory;
    file?: string;
    line?: number;
    column?: number;
    description: string;
    suggestion?: string;
    codeSnippet?: string;
}
export interface FileReview {
    file: string;
    issues: CodeIssue[];
    score: number;
    linesReviewed: number;
}
export interface ReviewReport {
    id: string;
    timestamp: string;
    files: FileReview[];
    issues: CodeIssue[];
    scores: Record<ReviewCategory, number>;
    overallScore: number;
    summary: string;
    recommendations: string[];
    regressions: string[];
}
export interface ReviewConfig {
    categories: ReviewCategory[];
    minSeverity: IssueSeverity;
    includeSnippets: boolean;
    maxIssuesPerFile: number;
}
export declare class CodeReviewer {
    private config;
    private issues;
    private fileReviews;
    private reviewCount;
    constructor(config?: Partial<ReviewConfig>);
    reviewCode(files: {
        path: string;
        content: string;
    }[], analyzer: (file: {
        path: string;
        content: string;
    }) => Promise<CodeIssue[]>): Promise<ReviewReport>;
    reviewWithPrompt(files: {
        path: string;
        content: string;
    }[], promptBuilder: (files: {
        path: string;
        content: string;
    }[]) => string, responseParser: (response: string) => CodeIssue[]): Promise<ReviewReport>;
    private generateReport;
    private calculateFileScore;
    private calculateCategoryScores;
    private calculateOverallScore;
    private generateSummary;
    private generateRecommendations;
    private identifyRegressions;
    private getSeverityWeight;
    getIssues(): CodeIssue[];
    getFileReviews(): FileReview[];
    getIssuesByCategory(category: ReviewCategory): CodeIssue[];
    getIssuesBySeverity(severity: IssueSeverity): CodeIssue[];
}
//# sourceMappingURL=reviewer.d.ts.map