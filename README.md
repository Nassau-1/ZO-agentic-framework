```text
███████╗ █████╗ ███████╗
╚══███╔╝██╔══██╗██╔════╝
  ███╔╝ ███████║█████╗
 ███╔╝  ██╔══██║██╔══╝
███████╗██║  ██║██║
╚══════╝╚═╝  ╚═╝╚═╝

Zero-to-one Agent Framework
```

# ZAF

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Local First](https://img.shields.io/badge/Local--First-Yes-brightgreen)](#local-first-model)
[![Stack: Node.js / Vanilla JS](https://img.shields.io/badge/Stack-Node.js%20%2F%20Vanilla%20JS-blue)](#stack)

**ZAF is the Zero-to-one Agent Framework.**

ZAF is a local-first control plane for running agent teams inside software projects.

It gives operators a live dashboard, ticket system, agent runner, audit trail and IDE integration to coordinate coding agents as structured contributors rather than isolated chat sessions.

## Why ZAF

Most agent workflows still break down at the operating layer. Agents can write code, but teams still need to answer basic execution questions:

- What is the agent working on?
- What ticket, goal and acceptance criteria is it following?
- What files is it allowed to touch?
- Is it progressing, looping or blocked?
- What did it do in the previous session?
- Which agent should pick up the next step?

ZAF is built around that operating layer.

It treats agents as role-based workers with defined scope, observable execution and persistent handoff state.

## What it gives you

| Capability | What it does |
|---|---|
| Agent control plane | Launch and monitor agent harnesses from a local dashboard |
| Ticket-native execution | Run agents against structured tickets with goals, blockers and acceptance criteria |
| Live telemetry | Stream process output and audit events into the dashboard in real time |
| Multi-agent workspace | Coordinate different agent roles across engineering, product, review and operations |
| Dependency graph | Visualise ticket blockers and ancestry across the programme |
| Codebase context | Generate repository context and inject it into agent runs |
| Loop detection | Flag repetitive process behaviour and intervene before an agent burns time |
| Skill extraction | Save reusable patterns from completed sessions and re-inject them later |
| IDE integration | Bring the control plane into VSCode with board, shells and audit views |
| Local-first operation | Keep tickets, logs and configs in files rather than a hosted database |

## Product surface

ZAF currently includes four main surfaces:

- a local dashboard
- a repository-native ticket system
- a CLI-based agent runner
- a VSCode extension (`ZAF Control`)

### Dashboard

A local web dashboard for operating the agent fleet.

Use it to view programme health, tickets, active agents, process consoles, dependency graphs, audit events and agent configuration.

### Ticket system

ZAF uses repository-native Markdown tickets.

Each ticket can define:

- goal
- status
- priority
- blockers
- scope boundaries
- acceptance criteria
- handoff log

Tickets live in the repository, so the operating history stays close to the code.

```text
WIP/
  tickets/
    OPEN/
    ACTIVE/
    BLOCKED/
    DONE/
    TICKETS.md
  programmes/
```

### Agent runner

Launch agents from the CLI or dashboard and bind them to a ticket.

Supported harnesses include:

| Harness | Use case |
|---|---|
| `mock` | Test the dashboard and telemetry without a real agent |
| `claude-code` | Run Claude Code against a scoped ticket |
| `codex` | Run Codex CLI with a ZAF seed prompt |
| `gemini-cli` | Run Gemini CLI as an agent harness |
| custom | Define your own binary, arguments and environment |

### VSCode extension

The `ZAF Control` extension brings the ZAF board, active shells and audit log into the editor.

## How it works

```text
Ticket
  -> role selection
  -> scoped agent prompt
  -> harness launch
  -> live process stream
  -> audit log
  -> handoff update
  -> reusable skill extraction
```

The core idea is simple: the file system is the source of truth. Tickets, programmes, logs, skills and configs remain inspectable, versionable and portable.

## Quick start

### Requirements

- Node.js 18+
- npm
- Rust and Cargo, only if building the Tauri desktop app from source

### Install

```bash
git clone https://github.com/Nassau-1/zaf.git
cd zaf
npm install
cd dashboard
npm install
cd ..
```

### Start the dashboard

```bash
npm start
```

The control server starts at:

```text
http://localhost:4242
```

Open the URL in your browser to access the dashboard.

### Use the CLI

```bash
# Show help and the ZAF banner
node cli/zaf.js

# Create a ticket
node cli/zaf.js ticket create "Implement database auth schema"

# Check ticket status
node cli/zaf.js ticket status TKT-ZAF-0005

# Launch an agent with the mock harness
node cli/zaf.js run engineering --ticket TKT-ZAF-0006 --harness mock
```

### Run the test harness

```bash
node cli/test-harness.js
```

See [`docs/QUICKSTART.md`](docs/QUICKSTART.md) for a more detailed walkthrough.

## Example workflow

```text
1. Create a ticket for a specific implementation task
2. Define the acceptance criteria and allowed scope
3. Launch an engineering agent on that ticket
4. Watch the agent stream in the dashboard
5. Review telemetry and audit events
6. Save useful execution patterns as reusable skills
7. Move the ticket to DONE or BLOCKED with a handoff note
```

## Local-first model

ZAF is designed to run locally.

It does not require a hosted database to operate. The framework stores tickets, programme files, logs, configs and reusable skills directly in the project workspace.

That makes the system:

- inspectable
- portable
- easy to version
- easier to audit
- independent from a hosted control plane

## Roadmap

Near-term priorities:

- cleaner onboarding flow
- packaged desktop release
- examples and demo project
- improved custom harness configuration
- richer screenshots and demo videos
- documented agent pack format
- clearer production hardening notes

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the detailed roadmap.

## Documentation

| Document | Description |
|---|---|
| [`docs/QUICKSTART.md`](docs/QUICKSTART.md) | Installation and first agent run |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Server, dashboard, CLI, extension and desktop architecture |
| [`docs/TICKET-STANDARD.md`](docs/TICKET-STANDARD.md) | Ticket format and workflow conventions |
| [`docs/EXTENSION-GUIDE.md`](docs/EXTENSION-GUIDE.md) | VSCode extension setup and usage |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Planned improvements |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | Release notes |

## Stack

| Layer | Technology |
|---|---|
| Control server | Node.js, HTTP, SSE |
| Dashboard | Vanilla HTML, CSS, JavaScript |
| Terminal streaming | PTY-backed process output |
| Visualisations | SVG-based graphs |
| Desktop shell | Tauri v2 |
| IDE integration | VSCode Extension API |

## Status

ZAF is an active early-stage framework. It is usable for local experimentation and agent workflow design, but the public documentation and packaging are still being cleaned up.

## License

MIT. See `LICENSE`.

## Author

Enzo Terrier, [@Nassau-1](https://github.com/Nassau-1)
