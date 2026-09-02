import type { Bug, TestCase, Task } from "../types/project.js";
import type { RecoveryCheckpoint } from "./recovery-types.js";

export interface ProjectVerifier {
  verifyFilesystem(files: string[]): Promise<{ exists: string[]; missing: string[] }>;
  verifyGitStatus(): Promise<{ branch: string; dirty: boolean; files: string[] }>;
  verifyGitDiff(): Promise<string>;
  verifyTests(runTests: () => Promise<{ passed: string[]; failed: string[] }>): Promise<{ passed: string[]; failed: string[] }>;
  verifyBuild(runBuild: () => Promise<{ success: boolean; errors: string[] }>): Promise<{ success: boolean; errors: string[] }>;
}

export class RealStateVerifier implements ProjectVerifier {
  async verifyFilesystem(files: string[]): Promise<{ exists: string[]; missing: string[] }> {
    const { access } = await import("fs/promises");
    const exists: string[] = [];
    const missing: string[] = [];

    for (const file of files) {
      try {
        await access(file);
        exists.push(file);
      } catch {
        missing.push(file);
      }
    }

    return { exists, missing };
  }

  async verifyGitStatus(): Promise<{ branch: string; dirty: boolean; files: string[] }> {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    try {
      const { stdout: branch } = await execAsync("git branch --show-current");
      const { stdout: status } = await execAsync("git status --porcelain");
      const files = status
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.substring(3));

      return {
        branch: branch.trim(),
        dirty: files.length > 0,
        files,
      };
    } catch {
      return { branch: "unknown", dirty: false, files: [] };
    }
  }

  async verifyGitDiff(): Promise<string> {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync("git diff");
      return stdout;
    } catch {
      return "";
    }
  }

  async verifyTests(
    runTests: () => Promise<{ passed: string[]; failed: string[] }>
  ): Promise<{ passed: string[]; failed: string[] }> {
    try {
      return await runTests();
    } catch {
      return { passed: [], failed: ["test_execution_error"] };
    }
  }

  async verifyBuild(
    runBuild: () => Promise<{ success: boolean; errors: string[] }>
  ): Promise<{ success: boolean; errors: string[] }> {
    try {
      return await runBuild();
    } catch (e) {
      return { success: false, errors: [(e as Error).message] };
    }
  }
}

export class StateVerifier {
  private verifier: ProjectVerifier;

  constructor(verifier?: ProjectVerifier) {
    this.verifier = verifier || new RealStateVerifier();
  }

  async verifyGitStatus(): Promise<{ branch: string; dirty: boolean; files: string[] }> {
    return this.verifier.verifyGitStatus();
  }

  async verifyGitDiff(): Promise<string> {
    return this.verifier.verifyGitDiff();
  }

  async verifyProjectState(checkpoint: RecoveryCheckpoint, sourceFiles: string[]): Promise<{
    filesystem: { exists: string[]; missing: string[] };
    git: { branch: string; dirty: boolean; files: string[] };
    gitDiff: string;
    stateMatch: boolean;
    discrepancies: string[];
  }> {
    const filesystem = await this.verifier.verifyFilesystem(sourceFiles);
    const git = await this.verifier.verifyGitStatus();
    const gitDiff = await this.verifier.verifyGitDiff();

    const discrepancies: string[] = [];

    if (filesystem.missing.length > 0) {
      discrepancies.push(`Missing files: ${filesystem.missing.join(", ")}`);
    }

    if (git.dirty) {
      discrepancies.push(`Uncommitted changes: ${git.files.length} files modified`);
    }

    if (gitDiff.length > 0) {
      discrepancies.push("Uncommitted diff exists");
    }

    return {
      filesystem,
      git,
      gitDiff,
      stateMatch: discrepancies.length === 0,
      discrepancies,
    };
  }

  async crossVerifyAgentClaims(
    agentClaims: string[],
    actualState: { tests: { passed: string[]; failed: string[] }; build: { success: boolean } }
  ): Promise<{ verified: string[]; contradicted: string[] }> {
    const verified: string[] = [];
    const contradicted: string[] = [];

    for (const claim of agentClaims) {
      const claimLower = claim.toLowerCase();

      if (claimLower.includes("test") && claimLower.includes("pass")) {
        if (actualState.tests.failed.length > 0) {
          contradicted.push(claim);
        } else {
          verified.push(claim);
        }
      } else if (claimLower.includes("build") && claimLower.includes("success")) {
        if (!actualState.build.success) {
          contradicted.push(claim);
        } else {
          verified.push(claim);
        }
      } else if (claimLower.includes("fix")) {
        if (actualState.tests.failed.length > 0) {
          contradicted.push(claim);
        } else {
          verified.push(claim);
        }
      } else {
        verified.push(claim);
      }
    }

    return { verified, contradicted };
  }
}
