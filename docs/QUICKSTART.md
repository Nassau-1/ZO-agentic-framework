# Quickstart

This guide walks through cloning ZAF, starting the local dashboard, running the CLI and launching a mock agent. No external API keys are required.

## Prerequisites

- Node.js 18 or later
- npm
- Git
- Rust and Cargo are only needed if you want to build the Tauri desktop app from source

## Clone

```bash
git clone https://github.com/Nassau-1/zaf.git
cd zaf
```

## Install dependencies

```bash
npm install
cd dashboard
npm install
cd ..
```

## Start the dashboard

```bash
npm start
```

The control server starts at:

```text
http://localhost:4242
```

Open that URL in a browser to access the dashboard.

## Show the CLI banner and help

```bash
node cli/zaf.js
```

This prints the ZAF banner and the available subcommands.

## Create a ticket

```bash
node cli/zaf.js ticket create "Implement database auth schema"
```

The new ticket is scaffolded under `WIP/tickets/ACTIVE/` and indexed in `WIP/tickets/TICKETS.md`.

## Check ticket status

```bash
node cli/zaf.js ticket status TKT-ZAF-0001
```

## Run a mock agent

The mock harness simulates a full agent run without calling any external API:

```bash
node cli/zaf.js run engineering --ticket TKT-ZAF-0001 --harness mock
```

You should see synthetic telemetry stream into the dashboard's Fleet view.

## Run the test harness

```bash
node cli/test-harness.js
```

## Try the demo project

A minimal demo project is available under [`examples/demo-project/`](../examples/demo-project/). It contains a single ticket that runs end-to-end with the mock harness, with no API keys required.

## Troubleshooting

- Port 4242 already in use. Stop the conflicting process or change the server port in `dashboard/server.js`.
- `npx` cannot find a CLI. Interactive harnesses (`claude-code`, `codex`, `gemini-cli`) require their respective CLIs installed and a real terminal. Use the `mock` harness to exercise the dashboard end-to-end.
- Empty terminal in the dashboard. Interactive CLIs require a TTY. The CLI prints an instructional banner when launched from a piped subshell. Switch to the `mock` harness or run the CLI from your terminal.

## Note on Tauri and Cargo

The Node.js dashboard and CLI do not need Rust or Cargo. Cargo is only required if you want to build the Tauri desktop wrapper from source.
