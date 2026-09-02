import React from "react";
import { Box, Text } from "ink";

interface ProgressBarProps {
  current: number;
  total: number;
  width?: number;
  label?: string;
}

export function ProgressBar({ current, total, width = 30, label }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const filled = total > 0 ? Math.round((current / total) * width) : 0;
  const empty = width - filled;

  const bar = "█".repeat(filled) + "░".repeat(empty);

  const color = percentage >= 100 ? "green" : percentage >= 50 ? "yellow" : "red";

  return (
    <Box flexDirection="column">
      {label && (
        <Text color="gray">
          {label}
        </Text>
      )}
      <Box>
        <Text color={color}>{bar}</Text>
        <Text color="white"> {percentage}%</Text>
      </Box>
      <Text color="gray">
        {current}/{total}
      </Text>
    </Box>
  );
}
