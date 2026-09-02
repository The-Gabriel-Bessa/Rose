import React from "react";
import { Box, Text } from "ink";

interface TaskListProps {
  tasks: {
    id: string;
    title: string;
    status: string;
  }[];
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="yellow"
      padding={1}
      marginBottom={1}
    >
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="yellow">
          TASKS
        </Text>
        <Text color="gray">
          {tasks.length} total
        </Text>
      </Box>

      <Box flexDirection="column" height={10}>
        {tasks.slice(0, 10).map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </Box>
    </Box>
  );
}

function TaskItem({ task }: { task: { id: string; title: string; status: string } }) {
  const { icon, color } = getStatusDisplay(task.status);

  return (
    <Box>
      <Text color={color}>{icon} </Text>
      <Text bold>{task.id}</Text>
      <Text color="gray">: </Text>
      <Text>{task.title}</Text>
    </Box>
  );
}

function getStatusDisplay(status: string): { icon: string; color: string } {
  switch (status) {
    case "COMPLETED":
      return { icon: "✓", color: "green" };
    case "IN_PROGRESS":
      return { icon: "●", color: "yellow" };
    case "FAILED":
      return { icon: "✗", color: "red" };
    case "BLOCKED":
      return { icon: "⊘", color: "red" };
    default:
      return { icon: "○", color: "gray" };
  }
}
