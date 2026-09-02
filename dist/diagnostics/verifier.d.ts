import type { RecoveryCheckpoint } from "./recovery-types.js";
export interface ProjectVerifier {
    verifyFilesystem(files: string[]): Promise<{
        exists: string[];
        missing: string[];
    }>;
    verifyGitStatus(): Promise<{
        branch: string;
        dirty: boolean;
        files: string[];
    }>;
    verifyGitDiff(): Promise<string>;
    verifyTests(runTests: () => Promise<{
        passed: string[];
        failed: string[];
    }>): Promise<{
        passed: string[];
        failed: string[];
    }>;
    verifyBuild(runBuild: () => Promise<{
        success: boolean;
        errors: string[];
    }>): Promise<{
        success: boolean;
        errors: string[];
    }>;
}
export declare class RealStateVerifier implements ProjectVerifier {
    verifyFilesystem(files: string[]): Promise<{
        exists: string[];
        missing: string[];
    }>;
    verifyGitStatus(): Promise<{
        branch: string;
        dirty: boolean;
        files: string[];
    }>;
    verifyGitDiff(): Promise<string>;
    verifyTests(runTests: () => Promise<{
        passed: string[];
        failed: string[];
    }>): Promise<{
        passed: string[];
        failed: string[];
    }>;
    verifyBuild(runBuild: () => Promise<{
        success: boolean;
        errors: string[];
    }>): Promise<{
        success: boolean;
        errors: string[];
    }>;
}
export declare class StateVerifier {
    private verifier;
    constructor(verifier?: ProjectVerifier);
    verifyGitStatus(): Promise<{
        branch: string;
        dirty: boolean;
        files: string[];
    }>;
    verifyGitDiff(): Promise<string>;
    verifyProjectState(checkpoint: RecoveryCheckpoint, sourceFiles: string[]): Promise<{
        filesystem: {
            exists: string[];
            missing: string[];
        };
        git: {
            branch: string;
            dirty: boolean;
            files: string[];
        };
        gitDiff: string;
        stateMatch: boolean;
        discrepancies: string[];
    }>;
    crossVerifyAgentClaims(agentClaims: string[], actualState: {
        tests: {
            passed: string[];
            failed: string[];
        };
        build: {
            success: boolean;
        };
    }): Promise<{
        verified: string[];
        contradicted: string[];
    }>;
}
//# sourceMappingURL=verifier.d.ts.map