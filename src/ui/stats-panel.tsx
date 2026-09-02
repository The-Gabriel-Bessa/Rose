import React from "react";
import { Box, Text } from "ink";
import type { TestCase, Bug, Task } from "../types/project.js";

interface StatsPanelProps {
  requirements: { total: number; validated: number };
  tests: { total: number; passed: number; failed: number; notRun: number };
  bugs: { total: number; open: number; fixed: number };
  tasks: Task[];
}

export function StatsPanel({ requirements, tests, bugs, tasks }: StatsPanelProps) {
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingTasks = tasks.filter((t) => t.status === "PENDING").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="green"
      padding={1}
      marginBottom={1}
    >
      <Text bold color="green">
        PROJECT STATUS
      </Text>

      <Box marginBottom={1}>
        <Box flexDirection="column" width="25%">
          <Text bold color="cyan">
            Requirements
          </Text>
          <Text>
            <Text color="green">{requirements.validated}</Text>
            <Text color="gray">/{requirements.total} validated</Text>
          </Text>
        </Box>

        <Box flexDirection="column" width="25%">
          <Text bold color="cyan">
            Tests
          </Text>
          <Text>
            <Text color="green">{tests.passed}</Text>
            <Text color="gray"> passed</Text>
            <Text color="red"> {tests.failed}</Text>
            <Text color="gray"> failed</Text>
          </Text>
        </Box>

        <Box flexDirection="column" width="25%">
          <Text bold color="cyan">
            Bugs
          </Text>
          <Text>
            <Text color="green">{bugs.fixed}</Text>
            <Text color="gray"> fixed</Text>
            <Text color="red"> {bugs.open}</Text>
            <Text color="gray"> open</Text>
          </Text>
        </Box>

        <Box flexDirection="column" width="25%">
          <Text bold color="cyan">
            Tasks
          </Text>
          <Text>
            <Text color="green">{completedTasks}</Text>
            <Text color="gray"> done</Text>
            <Text color="yellow"> {inProgressTasks}</Text>
            <Text color="gray"> active</Text>
            <Text color="white"> {pendingTasks}</Text>
            <Text color="gray"> pending</Text>
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
