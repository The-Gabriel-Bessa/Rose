export type ReviewCategory =
  | "correctness"
  | "architecture"
  | "maintainability"
  | "security"
  | "performance"
  | "error-handling"
  | "testing"
  | "ux"
  | "requirements"
  | "regression-risk";

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

const DEFAULT_REVIEW_CONFIG: ReviewConfig = {
  categories: [
    "correctness",
    "architecture",
    "maintainability",
    "security",
    "performance",
    "error-handling",
    "testing",
    "ux",
    "requirements",
    "regression-risk",
  ],
  minSeverity: "low",
  includeSnippets: true,
  maxIssuesPerFile: 20,
};

export class CodeReviewer {
  private config: ReviewConfig;
  private issues: CodeIssue[] = [];
  private fileReviews: FileReview[] = [];
  private reviewCount = 0;

  constructor(config: Partial<ReviewConfig> = {}) {
    this.config = { ...DEFAULT_REVIEW_CONFIG, ...config };
  }

  async reviewCode(
    files: { path: string; content: string }[],
    analyzer: (file: { path: string; content: string }) => Promise<CodeIssue[]>
  ): Promise<ReviewReport> {
    this.issues = [];
    this.fileReviews = [];
    this.reviewCount++;

    for (const file of files) {
      const fileIssues = await analyzer(file);
      const filteredIssues = fileIssues.filter(
        (issue) =>
          this.config.categories.includes(issue.category) &&
          this.getSeverityWeight(issue.severity) >= this.getSeverityWeight(this.config.minSeverity)
      );

      const limitedIssues = filteredIssues.slice(0, this.config.maxIssuesPerFile);

      this.issues.push(...limitedIssues);

      const score = this.calculateFileScore(limitedIssues);

      this.fileReviews.push({
        file: file.path,
        issues: limitedIssues,
        score,
        linesReviewed: file.content.split("\n").length,
      });
    }

    return this.generateReport();
  }

  async reviewWithPrompt(
    files: { path: string; content: string }[],
    promptBuilder: (files: { path: string; content: string }[]) => string,
    responseParser: (response: string) => CodeIssue[]
  ): Promise<ReviewReport> {
    const prompt = promptBuilder(files);

    const mockResponse = await Promise.resolve("");

    const issues = responseParser(mockResponse);

    this.issues = issues;
    this.fileReviews = [];
    this.reviewCount++;

    const issuesByFile = new Map<string, CodeIssue[]>();
    for (const issue of issues) {
      const file = issue.file || "unknown";
      if (!issuesByFile.has(file)) {
        issuesByFile.set(file, []);
      }
      issuesByFile.get(file)!.push(issue);
    }

    for (const [file, fileIssues] of issuesByFile) {
      const score = this.calculateFileScore(fileIssues);
      this.fileReviews.push({
        file,
        issues: fileIssues,
        score,
        linesReviewed: 0,
      });
    }

    return this.generateReport();
  }

  private generateReport(): ReviewReport {
    const scores = this.calculateCategoryScores();
    const overallScore = this.calculateOverallScore(scores);

    return {
      id: `REVIEW-${String(this.reviewCount).padStart(3, "0")}`,
      timestamp: new Date().toISOString(),
      files: this.fileReviews,
      issues: this.issues,
      scores,
      overallScore,
      summary: this.generateSummary(overallScore, scores),
      recommendations: this.generateRecommendations(scores),
      regressions: this.identifyRegressions(),
    };
  }

  private calculateFileScore(issues: CodeIssue[]): number {
    if (issues.length === 0) return 100;

    let penalty = 0;
    for (const issue of issues) {
      switch (issue.severity) {
        case "critical":
          penalty += 25;
          break;
        case "high":
          penalty += 15;
          break;
        case "medium":
          penalty += 8;
          break;
        case "low":
          penalty += 3;
          break;
      }
    }

    return Math.max(0, 100 - penalty);
  }

  private calculateCategoryScores(): Record<ReviewCategory, number> {
    const scores: Record<ReviewCategory, number> = {} as Record<ReviewCategory, number>;

    for (const category of this.config.categories) {
      const categoryIssues = this.issues.filter((i) => i.category === category);
      scores[category] = this.calculateFileScore(categoryIssues);
    }

    return scores;
  }

  private calculateOverallScore(scores: Record<ReviewCategory, number>): number {
    const values = Object.values(scores);
    if (values.length === 0) return 100;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  private generateSummary(overallScore: number, scores: Record<ReviewCategory, number>): string {
    const criticalCount = this.issues.filter((i) => i.severity === "critical").length;
    const highCount = this.issues.filter((i) => i.severity === "high").length;

    let summary = `Overall Quality Score: ${overallScore}/100\n\n`;

    if (criticalCount > 0) {
      summary += `CRITICAL: ${criticalCount} critical issues found\n`;
    }
    if (highCount > 0) {
      summary += `HIGH: ${highCount} high-severity issues found\n`;
    }

    summary += `\nCategory Breakdown:\n`;
    for (const [category, score] of Object.entries(scores)) {
      summary += `  ${category}: ${score}/100\n`;
    }

    return summary;
  }

  private generateRecommendations(scores: Record<ReviewCategory, number>): string[] {
    const recommendations: string[] = [];

    if (scores["security"] < 70) {
      recommendations.push("Security review required - multiple vulnerabilities detected");
    }
    if (scores["testing"] < 70) {
      recommendations.push("Test coverage needs improvement");
    }
    if (scores["error-handling"] < 70) {
      recommendations.push("Error handling patterns need review");
    }
    if (scores["performance"] < 70) {
      recommendations.push("Performance optimizations recommended");
    }
    if (scores["maintainability"] < 70) {
      recommendations.push("Code maintainability could be improved");
    }
    if (scores["architecture"] < 70) {
      recommendations.push("Consider refactoring for better architecture");
    }

    const criticalIssues = this.issues.filter((i) => i.severity === "critical");
    if (criticalIssues.length > 0) {
      recommendations.push("Address critical issues before deployment");
    }

    return recommendations;
  }

  private identifyRegressions(): string[] {
    const regressions: string[] = [];

    const requirementsIssues = this.issues.filter(
      (i) => i.category === "requirements"
    );
    for (const issue of requirementsIssues) {
      regressions.push(`${issue.description} (${issue.file || "unknown"})`);
    }

    return regressions;
  }

  private getSeverityWeight(severity: IssueSeverity): number {
    switch (severity) {
      case "critical":
        return 4;
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
    }
  }

  getIssues(): CodeIssue[] {
    return [...this.issues];
  }

  getFileReviews(): FileReview[] {
    return [...this.fileReviews];
  }

  getIssuesByCategory(category: ReviewCategory): CodeIssue[] {
    return this.issues.filter((i) => i.category === category);
  }

  getIssuesBySeverity(severity: IssueSeverity): CodeIssue[] {
    return this.issues.filter((i) => i.severity === severity);
  }
}
