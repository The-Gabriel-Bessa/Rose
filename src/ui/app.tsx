import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Dashboard } from "./dashboard.js";
import { Orchestrator } from "../core/orchestrator.js";
import type { RoseState } from "../types/state.js";
import type { ProjectState } from "../types/project.js";
import type { AgentHealthCheck, RecoveryCheckpoint } from "../diagnostics/recovery-types.js";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

interface AppProps {
  projectName: string;
  objective: string;
}

export function App({ projectName, objective }: AppProps) {
  const [state, setState] = useState<RoseState>("IDLE");
  const [projectState, setProjectState] = useState<ProjectState | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [health, setHealth] = useState<AgentHealthCheck | undefined>(undefined);
  const [checkpoints, setCheckpoints] = useState<RecoveryCheckpoint[]>([]);
  const [recoveryCount, setRecoveryCount] = useState(0);
  const [orchestrator, setOrchestrator] = useState<Orchestrator | null>(null);
  const [started, setStarted] = useState(false);

  const { exit } = useApp();

  const addLog = useCallback(
    (level: LogEntry["level"], message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev.slice(-100), { timestamp, level, message }]);
    },
    []
  );

  useEffect(() => {
    const orch = new Orchestrator(projectName, objective, {}, {
      onStateChange: (newState, previous) => {
        setState(newState);
        addLog("info", `${previous} → ${newState}`);
      },
      onProgress: (message) => {
        addLog("info", message);
      },
      onError: (error) => {
        addLog("error", error.message);
      },
      onBugFound: (bug) => {
        addLog("warn", `BUG FOUND: ${bug.title}`);
      },
      onTaskComplete: (task) => {
        addLog("success", `Task completed: ${task.title}`);
      },
      onRecovery: (checkpointId, reason) => {
        addLog("warn", `RECOVERY: ${checkpointId} - ${reason}`);
        setRecoveryCount((prev) => prev + 1);
        setCheckpoints(orch.getRecoveryManager().getCheckpoints());
      },
      onAgentHealth: (status, score) => {
        setHealth({
          timestamp: new Date().toISOString(),
          status: status as any,
          score,
          details: "",
          metrics: {
            attemptCount: 0,
            uniqueSolutions: 0,
            repeatedSolutions: 0,
            failedAttempts: 0,
            successfulAttempts: 0,
            contextTokensUsed: 0,
            contextTokensRemaining: 100000,
            timeSinceLastSuccess: 0,
            errorRate: 0,
          },
        });
      },
    });

    setOrchestrator(orch);
    setProjectState(orch.projectState);
  }, [projectName, objective]);

  useInput((input, key) => {
    if (input === "q") {
      if (orchestrator) {
        orchestrator.stop();
      }
      exit();
    }

    if (input === "s" && !started && orchestrator) {
      setStarted(true);
      addLog("info", "Starting Rose Orchestrator...");
      orchestrator.start().then(() => {
        addLog("success", "Rose Orchestrator completed!");
        setProjectState(orchestrator.projectState);
      }).catch((error) => {
        addLog("error", `Error: ${error.message}`);
      });
    }

    if (input === "r" && orchestrator) {
      setProjectState(orchestrator.projectState);
      setCheckpoints(orchestrator.getRecoveryManager().getCheckpoints());
    }
  });

  if (!projectState) {
    return (
      <Box padding={1}>
        <Text color="cyan">Initializing Rose Orchestrator...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Dashboard
        state={state}
        projectState={projectState}
        logs={logs}
        health={health}
        checkpoints={checkpoints}
        recoveryCount={recoveryCount}
      />

      <Box
        borderStyle="round"
        borderColor="gray"
        padding={1}
        marginTop={1}
      >
        <Text color="gray">
          Press <Text bold color="cyan">S</Text> to start | 
          <Text bold color="cyan"> R</Text> to refresh | 
          <Text bold color="cyan"> Q</Text> to quit
        </Text>
      </Box>
    </Box>
  );
}
