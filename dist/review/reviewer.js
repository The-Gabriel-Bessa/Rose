const DEFAULT_REVIEW_CONFIG = {
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
    config;
    issues = [];
    fileReviews = [];
    reviewCount = 0;
    constructor(config = {}) {
        this.config = { ...DEFAULT_REVIEW_CONFIG, ...config };
    }
    async reviewCode(files, analyzer) {
        this.issues = [];
        this.fileReviews = [];
        this.reviewCount++;
        for (const file of files) {
            const fileIssues = await analyzer(file);
            const filteredIssues = fileIssues.filter((issue) => this.config.categories.includes(issue.category) &&
                this.getSeverityWeight(issue.severity) >= this.getSeverityWeight(this.config.minSeverity));
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
    async reviewWithPrompt(files, promptBuilder, responseParser) {
        const prompt = promptBuilder(files);
        const mockResponse = await Promise.resolve("");
        const issues = responseParser(mockResponse);
        this.issues = issues;
        this.fileReviews = [];
        this.reviewCount++;
        const issuesByFile = new Map();
        for (const issue of issues) {
            const file = issue.file || "unknown";
            if (!issuesByFile.has(file)) {
                issuesByFile.set(file, []);
            }
            issuesByFile.get(file).push(issue);
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
    generateReport() {
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
    calculateFileScore(issues) {
        if (issues.length === 0)
            return 100;
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
    calculateCategoryScores() {
        const scores = {};
        for (const category of this.config.categories) {
            const categoryIssues = this.issues.filter((i) => i.category === category);
            scores[category] = this.calculateFileScore(categoryIssues);
        }
        return scores;
    }
    calculateOverallScore(scores) {
        const values = Object.values(scores);
        if (values.length === 0)
            return 100;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }
    generateSummary(overallScore, scores) {
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
    generateRecommendations(scores) {
        const recommendations = [];
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
    identifyRegressions() {
        const regressions = [];
        const requirementsIssues = this.issues.filter((i) => i.category === "requirements");
        for (const issue of requirementsIssues) {
            regressions.push(`${issue.description} (${issue.file || "unknown"})`);
        }
        return regressions;
    }
    getSeverityWeight(severity) {
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
    getIssues() {
        return [...this.issues];
    }
    getFileReviews() {
        return [...this.fileReviews];
    }
    getIssuesByCategory(category) {
        return this.issues.filter((i) => i.category === category);
    }
    getIssuesBySeverity(severity) {
        return this.issues.filter((i) => i.severity === severity);
    }
}
//# sourceMappingURL=reviewer.js.map