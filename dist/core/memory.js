export class ProjectMemory {
    state;
    constructor(projectName, objective) {
        this.state = {
            projectName,
            objective,
            requirements: [],
            tests: [],
            bugs: [],
            tasks: [],
            iterations: [],
            currentIteration: 0,
            currentTaskIndex: 0,
            state: "IDLE",
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalAttempts: 0,
            decisions: [],
        };
    }
    getState() {
        return { ...this.state };
    }
    addRequirement(description) {
        const req = {
            id: `REQ-${String(this.state.requirements.length + 1).padStart(3, "0")}`,
            description,
            status: "IDENTIFIED",
            testIds: [],
            bugIds: [],
            notes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.state.requirements.push(req);
        this.touch();
        return req;
    }
    addTest(test) {
        const tc = {
            ...test,
            id: `TEST-${String(this.state.tests.length + 1).padStart(3, "0")}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.state.tests.push(tc);
        const req = this.state.requirements.find((r) => r.id === test.requirementId);
        if (req) {
            req.testIds.push(tc.id);
        }
        this.touch();
        return tc;
    }
    addBug(bug) {
        const b = {
            ...bug,
            id: `BUG-${String(this.state.bugs.length + 1).padStart(3, "0")}`,
            fixAttempts: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.state.bugs.push(b);
        const req = this.state.requirements.find((r) => r.id === bug.requirementId);
        if (req) {
            req.bugIds.push(b.id);
        }
        this.touch();
        return b;
    }
    updateBug(bugId, updates) {
        const bug = this.state.bugs.find((b) => b.id === bugId);
        if (bug) {
            Object.assign(bug, updates, { updatedAt: new Date().toISOString() });
            this.touch();
        }
    }
    addTask(task) {
        const t = {
            ...task,
            id: `TASK-${String(this.state.tasks.length + 1).padStart(3, "0")}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.state.tasks.push(t);
        this.touch();
        return t;
    }
    updateTask(taskId, updates) {
        const task = this.state.tasks.find((t) => t.id === taskId);
        if (task) {
            Object.assign(task, updates, { updatedAt: new Date().toISOString() });
            this.touch();
        }
    }
    startIteration() {
        this.state.currentIteration++;
        const iteration = {
            number: this.state.currentIteration,
            startedAt: new Date().toISOString(),
            state: this.state.state,
            tasksCompleted: 0,
            tasksFailed: 0,
            bugsFound: 0,
            bugsFixed: 0,
            testsPassed: 0,
            testsFailed: 0,
            notes: [],
        };
        this.state.iterations.push(iteration);
        this.touch();
        return iteration;
    }
    completeIteration() {
        const iteration = this.state.iterations[this.state.iterations.length - 1];
        if (iteration) {
            iteration.completedAt = new Date().toISOString();
        }
        this.touch();
    }
    addDecision(decision) {
        this.state.decisions.push(decision);
        this.touch();
    }
    updateState(state) {
        this.state.state = state;
        this.touch();
    }
    getRequirementStats() {
        const total = this.state.requirements.length;
        const validated = this.state.requirements.filter((r) => r.status === "VALIDATED").length;
        return { total, validated, percentage: total > 0 ? (validated / total) * 100 : 0 };
    }
    getTestStats() {
        const total = this.state.tests.length;
        const passed = this.state.tests.filter((t) => t.status === "PASS").length;
        const failed = this.state.tests.filter((t) => t.status === "FAIL").length;
        const notRun = this.state.tests.filter((t) => t.status === "NOT_RUN").length;
        return { total, passed, failed, notRun };
    }
    getBugStats() {
        const total = this.state.bugs.length;
        const open = this.state.bugs.filter((b) => b.status === "OPEN").length;
        const fixed = this.state.bugs.filter((b) => b.status === "FIXED" || b.status === "VERIFIED").length;
        return { total, open, fixed };
    }
    touch() {
        this.state.updatedAt = new Date().toISOString();
    }
}
//# sourceMappingURL=memory.js.map