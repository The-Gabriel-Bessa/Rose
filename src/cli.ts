#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import { Command } from "commander";
import { App } from "./ui/app.js";

const program = new Command();

program
  .name("rose")
  .description("Rose - Autonomous Developer / Tester / User Orchestrator")
  .version("0.1.0");

program
  .command("start")
  .description("Start the Rose Orchestrator")
  .requiredOption("-n, --name <name>", "Project name")
  .requiredOption("-o, --objective <objective>", "Project objective")
  .action((options) => {
    const { waitUntilExit } = render(
      React.createElement(App, {
        projectName: options.name,
        objective: options.objective,
      })
    );

    waitUntilExit().then(() => {
      process.exit(0);
    });
  });

program
  .command("serve")
  .description("Start Rose in headless mode (server only)")
  .option("-p, --port <port>", "Port to listen on", "4097")
  .action(async (options) => {
    console.log(`Rose headless mode on port ${options.port}`);
    console.log("Press Ctrl+C to stop");

    process.on("SIGINT", () => {
      console.log("\nShutting down...");
      process.exit(0);
    });
  });

program.parse();
