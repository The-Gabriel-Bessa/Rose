import React from "react";
import { Box, Text } from "ink";
import type { AgentHealthCheck, RecoveryCheckpoint } from "../diagnostics/recovery-types.js";

interface RecoveryPanelProps {
  health?: AgentHealthCheck;
  checkpoints: RecoveryCheckpoint[];
  recoveryCount: number;
}

export function RecoveryPanel({ health, checkpoints, recoveryCount }: RecoveryPanelProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="magenta"
      padding={1}
      marginBottom={1}
    >
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="magenta">
          AGENT RECOVERY
        </Text>
        <Text color="gray">
          {recoveryCount} recoveries
        </Text>
      </Box>

      {health && (
        <Box marginBottom={1}>
          <Box flexDirection="column" width="50%">
            <Text bold color="cyan">
              Health Status
            </Text>
            <Text color={getHealthColor(health.status)}>
              {health.status.toUpperCase()} (Score: {health.score}/100)
            </Text>
          </Box>

          <Box flexDirection="column" width="50%">
            <Text bold color="cyan">
              Metrics
            </Text>
            <Text>
              Attempts: {health.metrics.attemptCount} | 
              Failed: {health.metrics.failedAttempts} | 
              Error Rate: {Math.round(health.metrics.errorRate * 100)}%
            </Text>
          </Box>
        </Box>
      )}

      {checkpoints.length > 0 && (
        <Box flexDirection="column">
          <Text bold color="cyan">
            Recent Checkpoints
          </Text>
          {checkpoints.slice(-3).map((cp, index) => (
            <Box key={index} marginBottom={1}>
              <Text color="gray">
                {cp.id}: {cp.reasonForRecovery}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function getHealthColor(status: string): string {
  switch (status) {
    case "healthy":
      return "green";
    case "degraded":
      return "yellow";
    case "critical":
      return "red";
    case "failed":
      return "red";
    default:
      return "white";
  }
}
