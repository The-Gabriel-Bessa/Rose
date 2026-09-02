export class RealStateVerifier {
    async verifyFilesystem(files) {
        const { access } = await import("fs/promises");
        const exists = [];
        const missing = [];
        for (const file of files) {
            try {
                await access(file);
                exists.push(file);
            }
            catch {
                missing.push(file);
            }
        }
        return { exists, missing };
    }
    async verifyGitStatus() {
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
        }
        catch {
            return { branch: "unknown", dirty: false, files: [] };
        }
    }
    async verifyGitDiff() {
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);
        try {
            const { stdout } = await execAsync("git diff");
            return stdout;
        }
        catch {
            return "";
        }
    }
    async verifyTests(runTests) {
        try {
            return await runTests();
        }
        catch {
            return { passed: [], failed: ["test_execution_error"] };
        }
    }
    async verifyBuild(runBuild) {
        try {
            return await runBuild();
        }
        catch (e) {
            return { success: false, errors: [e.message] };
        }
    }
}
export class StateVerifier {
    verifier;
    constructor(verifier) {
        this.verifier = verifier || new RealStateVerifier();
    }
    async verifyGitStatus() {
        return this.verifier.verifyGitStatus();
    }
    async verifyGitDiff() {
        return this.verifier.verifyGitDiff();
    }
    async verifyProjectState(checkpoint, sourceFiles) {
        const filesystem = await this.verifier.verifyFilesystem(sourceFiles);
        const git = await this.verifier.verifyGitStatus();
        const gitDiff = await this.verifier.verifyGitDiff();
        const discrepancies = [];
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
    async crossVerifyAgentClaims(agentClaims, actualState) {
        const verified = [];
        const contradicted = [];
        for (const claim of agentClaims) {
            const claimLower = claim.toLowerCase();
            if (claimLower.includes("test") && claimLower.includes("pass")) {
                if (actualState.tests.failed.length > 0) {
                    contradicted.push(claim);
                }
                else {
                    verified.push(claim);
                }
            }
            else if (claimLower.includes("build") && claimLower.includes("success")) {
                if (!actualState.build.success) {
                    contradicted.push(claim);
                }
                else {
                    verified.push(claim);
                }
            }
            else if (claimLower.includes("fix")) {
                if (actualState.tests.failed.length > 0) {
                    contradicted.push(claim);
                }
                else {
                    verified.push(claim);
                }
            }
            else {
                verified.push(claim);
            }
        }
        return { verified, contradicted };
    }
}
//# sourceMappingURL=verifier.js.map