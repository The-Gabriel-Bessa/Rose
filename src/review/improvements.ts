export type ImprovementCategory =
  | "code-duplication"
  | "unhandled-errors"
  | "missing-tests"
  | "partial-implementation"
  | "critical-todos"
  | "broken-dependencies"
  | "performance"
  | "ux"
  | "requirements-inconsistency"
  | "regression-risk"
  | "security"
  | "maintainability";

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

const DEFAULT_IMPROVEMENT_CONFIG: ImprovementConfig = {
  categories: [
    "code-duplication",
    "unhandled-errors",
    "missing-tests",
    "partial-implementation",
    "critical-todos",
    "broken-dependencies",
    "performance",
    "ux",
    "requirements-inconsistency",
    "regression-risk",
    "security",
    "maintainability",
  ],
  autoApply: false,
  minPriority: "low",
  maxImprovements: 50,
};

export class ImprovementEngine {
  private config: ImprovementConfig;
  private improvements: Improvement[] = [];
  private scanCount = 0;

  constructor(config: Partial<ImprovementConfig> = {}) {
    this.config = { ...DEFAULT_IMPROVEMENT_CONFIG, ...config };
  }

  async scan(
    files: { path: string; content: string }[],
    scanner: (files: { path: string; content: string }[]) => Promise<Improvement[]>
  ): Promise<ImprovementScanResult> {
    const startTime = Date.now();
    this.scanCount++;

    const rawImprovements = await scanner(files);

    const filteredImprovements = rawImprovements
      .filter(
        (imp) =>
          this.config.categories.includes(imp.category) &&
          this.getPriorityWeight(imp.priority) >= this.getPriorityWeight(this.config.minPriority)
      )
      .slice(0, this.config.maxImprovements);

    this.improvements = filteredImprovements;

    const summary = this.calculateSummary();

    return {
      id: `SCAN-${String(this.scanCount).padStart(3, "0")}`,
      timestamp: new Date().toISOString(),
      improvements: filteredImprovements,
      summary,
      scanDuration: Date.now() - startTime,
    };
  }

  async scanWithPrompt(
    files: { path: string; content: string }[],
    promptBuilder: (files: { path: string; content: string }[]) => string,
    responseParser: (response: string) => Improvement[]
  ): Promise<ImprovementScanResult> {
    const startTime = Date.now();
    this.scanCount++;

    const prompt = promptBuilder(files);
    const mockResponse = await Promise.resolve("");
    const improvements = responseParser(mockResponse);

    this.improvements = improvements.filter((imp) =>
      this.config.categories.includes(imp.category)
    );

    const summary = this.calculateSummary();

    return {
      id: `SCAN-${String(this.scanCount).padStart(3, "0")}`,
      timestamp: new Date().toISOString(),
      improvements: this.improvements,
      summary,
      scanDuration: Date.now() - startTime,
    };
  }

  applyImprovement(improvementId: string): void {
    const improvement = this.improvements.find((i) => i.id === improvementId);
    if (improvement) {
      improvement.applied = true;
      improvement.appliedAt = new Date().toISOString();
    }
  }

  applyAll(): Improvement[] {
    const applied: Improvement[] = [];

    for (const improvement of this.improvements) {
      if (!improvement.applied) {
        improvement.applied = true;
        improvement.appliedAt = new Date().toISOString();
        applied.push(improvement);
      }
    }

    return applied;
  }

  getImprovements(): Improvement[] {
    return [...this.improvements];
  }

  getPendingImprovements(): Improvement[] {
    return this.improvements.filter((i) => !i.applied);
  }

  getAppliedImprovements(): Improvement[] {
    return this.improvements.filter((i) => i.applied);
  }

  getImprovementsByCategory(category: ImprovementCategory): Improvement[] {
    return this.improvements.filter((i) => i.category === category);
  }

  getImprovementsByPriority(priority: ImprovementPriority): Improvement[] {
    return this.improvements.filter((i) => i.priority === priority);
  }

  getSummary(): {
    total: number;
    applied: number;
    pending: number;
    byCategory: Record<ImprovementCategory, number>;
    byPriority: Record<ImprovementPriority, number>;
  } {
    const byCategory = {} as Record<ImprovementCategory, number>;
    const byPriority = {} as Record<ImprovementPriority, number>;

    for (const imp of this.improvements) {
      byCategory[imp.category] = (byCategory[imp.category] || 0) + 1;
      byPriority[imp.priority] = (byPriority[imp.priority] || 0) + 1;
    }

    return {
      total: this.improvements.length,
      applied: this.improvements.filter((i) => i.applied).length,
      pending: this.improvements.filter((i) => !i.applied).length,
      byCategory,
      byPriority,
    };
  }

  private calculateSummary() {
    return {
      total: this.improvements.length,
      high: this.improvements.filter((i) => i.priority === "high").length,
      medium: this.improvements.filter((i) => i.priority === "medium").length,
      low: this.improvements.filter((i) => i.priority === "low").length,
      applied: this.improvements.filter((i) => i.applied).length,
      pending: this.improvements.filter((i) => !i.applied).length,
    };
  }

  private getPriorityWeight(priority: ImprovementPriority): number {
    switch (priority) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
    }
  }

  generateReport(): string {
    const summary = this.getSummary();

    let report = `Improvement Scan Report\n`;
    report += `========================\n\n`;
    report += `Total: ${summary.total}\n`;
    report += `Applied: ${summary.applied}\n`;
    report += `Pending: ${summary.pending}\n\n`;

    report += `By Priority:\n`;
    report += `  High: ${summary.byPriority.high || 0}\n`;
    report += `  Medium: ${summary.byPriority.medium || 0}\n`;
    report += `  Low: ${summary.byPriority.low || 0}\n\n`;

    report += `By Category:\n`;
    for (const [category, count] of Object.entries(summary.byCategory)) {
      report += `  ${category}: ${count}\n`;
    }

    if (this.improvements.length > 0) {
      report += `\nPending Improvements:\n`;
      for (const imp of this.getPendingImprovements()) {
        report += `  [${imp.priority}] ${imp.title}\n`;
        report += `    ${imp.description}\n`;
        report += `    Files: ${imp.affectedFiles.join(", ")}\n\n`;
      }
    }

    return report;
  }
}
