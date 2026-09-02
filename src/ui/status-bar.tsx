import React from "react";
import { Box, Text } from "ink";
import type { RoseState } from "../types/state.js";
import type { ProjectState } from "../types/project.js";

interface StatusBarProps {
  state: RoseState;
  projectName: string;
  iteration: number;
  uptime: string;
}

export function StatusBar({ state, projectName, iteration, uptime }: StatusBarProps) {
  const stateColor = getStateColor(state);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      padding={1}
      marginBottom={1}
    >
      <Box justifyContent="space-between">
        <Text bold color="cyan">
          ROSE ORCHESTRATOR
        </Text>
        <Text color="gray">
          v0.1.0
        </Text>
      </Box>
      <Box justifyContent="space-between" marginTop={1}>
        <Text>
          Project: <Text bold color="white">{projectName}</Text>
        </Text>
        <Text>
          Iteration: <Text bold color="yellow">{iteration}</Text>
        </Text>
        <Text>
          Uptime: <Text color="green">{uptime}</Text>
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text>
          Status: <Text bold color={stateColor}>{state}</Text>
        </Text>
      </Box>
    </Box>
  );
}

function getStateColor(state: RoseState): string {
  switch (state) {
    case "COMPLETED":
      return "green";
    case "FAILED":
    case "BLOCKED":
    case "TIMEOUT":
      return "red";
    case "BUG_FOUND":
      return "yellow";
    case "FIXING":
    case "RETESTING":
      return "yellow";
    case "TESTING":
    case "BUILDING":
      return "blue";
    case "IMPLEMENTING":
      return "magenta";
    default:
      return "white";
  }
}
