import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  maxLines?: number;
}

export function LogViewer({ logs, maxLines = 15 }: LogViewerProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const recentLogs = logs.slice(-maxLines);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="gray"
      padding={1}
    >
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="gray">
          LOGS
        </Text>
        <Text color="gray">
          {logs.length} entries
        </Text>
      </Box>

      <Box flexDirection="column" height={maxLines}>
        {recentLogs.map((log, index) => (
          <LogLine key={index} log={log} />
        ))}
      </Box>
    </Box>
  );
}

function LogLine({ log }: { log: LogEntry }) {
  const color = getLevelColor(log.level);
  const icon = getLevelIcon(log.level);

  return (
    <Box>
      <Text color="gray">{log.timestamp} </Text>
      <Text color={color}>{icon} </Text>
      <Text>{log.message}</Text>
    </Box>
  );
}

function getLevelColor(level: string): string {
  switch (level) {
    case "error":
      return "red";
    case "warn":
      return "yellow";
    case "success":
      return "green";
    default:
      return "white";
  }
}

function getLevelIcon(level: string): string {
  switch (level) {
    case "error":
      return "✗";
    case "warn":
      return "⚠";
    case "success":
      return "✓";
    default:
      return "●";
  }
}
