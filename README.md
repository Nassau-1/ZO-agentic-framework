# ZO.AF — Zero to One Agentic Framework

> **The sovereign control plane for autonomous and multi-agent teams.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Local First](https://img.shields.io/badge/Local--First-Yes-brightgreen)](#)
[![Stack: Node.js / Vanilla JS](https://img.shields.io/badge/Stack-Node.js%20%2F%20Vanilla%20JS-blue)](#)

ZO.AF is a self-hosted, local-first agentic operating system for coordinating, running, and visualising teams of autonomous AI agents. It treats agents as structured employees with defined roles, clear goal alignment, and full auditability — not as stateless chat endpoints.

The framework owns the full stack: a live-telemetry control server, a ~5000-line SPA dashboard, a CLI harness runner, a Tauri v2 desktop wrapper, and a VSCode extension that brings the control plane directly into your editor.

---

## Core Philosophy

1. **Agents as Employees** — Agents carry roles, skillsets, and bounded write permissions. They are scheduled, monitored, and auditable.
2. **Directory-First State** — The filesystem is the database. Tickets, logs, and agent configs are Markdown files. No vendor lock-in, no external database required.
3. **Goal-Aware Dependency Graph** — Tasks have explicit blockers and ancestry edges so agents always know the *why* behind their work, not just the *what*.
4. **Sovereign by Default** — Every component runs locally. The server, the dashboard, the harness runner, and the IDE integration all work without cloud dependencies.

---

## Architecture

### `dashboard/server.js` — Control Server (port 4242)

Node.js HTTP + SSE server. Responsibilities:

- **Multi-repo ticket scanning** — watches workspace repos, surfaces tickets into the unified dashboard.
- **PTY-based agent subprocess spawning** — launches harness processes in pseudo-terminals; streams stdout/stderr in real time.
- **SSE live-push** — pushes events to all connected dashboard clients in under one second.
- **Audit log (JSONL)** — every agent event is appended to a structured JSONL audit trail.
- **Repo context generation** — static analysis pass that writes `CODEBASE.md` and injects it into every agent seed prompt.
- **Agent Marketplace** — `GET /api/marketplace`, `POST /api/marketplace/import`: import agent packs from a git URL (Format A: `.md` frontmatter, Format B: `agents.json`), preview and select agents, duplicate to local config.
- **Loop detection** — rolling 20-event window; emits `agent.loop` audit event and offers auto-kill when a loop is detected.
- **Skill extraction** — `GET /api/process/skills`, `POST /api/skill/save`: pattern analysis over the classified PTY event stream; saves extracted skills as `.zaf-skills/*.zaf-skill.md`.
- **Agent config persistence** — reads and writes `config.json` for per-agent settings.

### `dashboard/app.js` — Dashboard SPA (~5000 lines, vanilla JS)

Single-page application with full client-side routing. Views:

| View | Description |
|---|---|
| **Overview** | Programme health, active agent count, recent audit events |
| **Programme** | Programme-level goals, phase status, phase completion |
| **Board** | Kanban board across ticket states (OPEN, ACTIVE, BLOCKED, DONE) |
| **Fleet** | Live agent roster, per-agent console, harness status |
| **Dependency Graph** | Force-directed SVG graph of ticket blockers and ancestry |
| **Archive** | Closed tickets and historical runs |
| **Codebase Map** | Force-directed SVG file graph generated from static analysis; click-to-inspect symbols; "Generate CODEBASE.md" button |
| **Control Center** | 5-tab panel: Ticket Builder, Agent Editor, Marketplace, Telemetry, CLI Hub |
| **Org Builder** | Define and edit agent roles and team structure |
| **Audit Log** | Searchable, filterable JSONL audit event viewer |

Multi-console terminal panel powered by xterm.js PTY mirrors — each spawned process gets a dedicated console tab with full output replay.

### `dashboard/index.html` — App Shell

Loads xterm.js (CDN), marked.js, and the SPA entry point.

### `dashboard/style.css` + `dashboard/style-paperclip.css` — Design System

Glassmorphic dark design system with CSS custom properties throughout.

### `cli/zo.js` — ZAF CLI

Command-line control plane: `run`, `ticket`, `scaffold` subcommands. Builds and injects seed prompts, manages harness subprocess lifecycle, and coordinates with the control server.

### `src-tauri/` — Desktop App

Tauri v2 wrapper. Features: system tray icon, minimize-to-tray, Node sidecar management, native OS notifications for sweep completions and agent alerts.

### `extension/` — VSCode Extension (`zaf-control` 2.0.0)

Brings the control plane into the editor. See [docs/EXTENSION-GUIDE.md](docs/EXTENSION-GUIDE.md) for full usage.

---

## Agent Harnesses

ZO.AF's subprocess runner accepts a `--harness` flag that selects the agent execution environment. Supported harnesses:

| Harness | Description |
|---|---|
| `mock` | Built-in simulator. Generates synthetic PTY output for testing dashboards, loop detection, and skill extraction without running a real AI agent. |
| `claude-code` | Spawns a Claude Code CLI session scoped to the ticket's allowed paths and seed prompt. |
| `codex` | OpenAI Codex CLI harness with ZAF seed-prompt injection. |
| `antigravity` | Antigravity fork of Claude Code; identical interface, alternate binary. |
| `gemini-cli` | Google Gemini CLI harness. |
| **Custom** | Any harness can be defined in the Control Center → Agent Editor UI. Custom harnesses specify the binary path, argument template, and environment variables. |

---

## Phase 9 Features

These capabilities were added after the initial release and represent the current production surface:

### Codebase Map

Pure-JS static analysis (no external dependencies) builds a force-directed SVG file graph of the active repo. Nodes are files; edges represent imports, references, and ticket associations. Click any node to inspect its exported symbols. The "Generate CODEBASE.md" button writes a structured context document that is automatically injected into every agent seed prompt, giving agents accurate file-level awareness of the codebase they are operating in.

### Agent Loop Detector

A rolling 20-event window monitors each agent's PTY stream for repetitive patterns. When a loop is detected, the affected console tab shows a pulsing amber ⟳ badge. The operator can acknowledge or trigger an auto-kill of the subprocess. The detection event is written to the audit log as `agent.loop`.

### Session Skill Extractor

After a process completes, pattern analysis runs over the classified PTY event stream to identify reusable skills demonstrated during the session. An "Extract skill" button appears on completed processes. Extracted skills are saved as `.zaf-skills/*.zaf-skill.md` and are auto-injected into the seed prompts of subsequent agent runs, accumulating institutional knowledge across sessions.

### Agent Marketplace

Import agent packs from any git URL directly from the Control Center → Marketplace tab. Two pack formats are supported:

- **Format A** — individual `.md` files with YAML frontmatter defining role, skills, and directives.
- **Format B** — `agents.json` manifest listing multiple agent definitions.

Preview and select individual agents before importing. Imported agents can be duplicated to local config for customisation. All imported packs are tracked so re-imports are idempotent.

---

## Ticket System

Tickets live under `WIP/tickets/` and follow the ZAF ticket standard (`docs/ticket-standard.md`).

```
WIP/
├── tickets/
│   ├── TICKETS.md          # Master index: all tickets, status, priority, blocked_by
│   ├── ACTIVE/             # Tickets currently in progress (one .md file per ticket)
│   ├── OPEN/               # Queued tickets ready to be picked up
│   ├── BLOCKED/            # Tickets with unresolved blockers
│   └── DONE/               # Completed tickets (historical reference)
└── programmes/             # Programme-level goal documents
```

Each ticket file contains: metadata header (YAML frontmatter), goal statement, acceptance criteria, scope boundaries, and a Handoff Log. The Handoff Log is append-only and serves as the live state for multi-session work — the last entry is always the current state.

The dashboard Board view renders tickets from this directory structure. The Dependency Graph derives blocker edges from `blocked_by` fields in ticket frontmatter.

---

## Repository Structure

```
zo-agentic-framework/
├── README.md
├── package.json
├── cli/
│   ├── zo.js               # CLI entrypoint: run, ticket, scaffold
│   └── test-harness.js     # Automated harness and telemetry tests
├── dashboard/
│   ├── server.js           # HTTP + SSE control server (port 4242)
│   ├── app.js              # ~5000-line vanilla-JS SPA
│   ├── index.html          # App shell (xterm.js, marked.js)
│   ├── style.css           # Glassmorphic dark design system
│   ├── style-paperclip.css # Paperclip design layer
│   └── package.json        # Node dependencies
├── docs/
│   ├── agent-taxonomy.md   # Role definitions and persona specs
│   ├── app-design.md       # Dashboard UX design notes
│   ├── cli-design.md       # CLI architecture notes
│   ├── coo-spec.md         # COO agent specification
│   ├── extension-design.md # VSCode extension design notes
│   ├── EXTENSION-GUIDE.md  # VSCode extension user guide
│   ├── programme-standard.md
│   ├── session-bootstrap.md
│   └── ticket-standard.md
├── extension/
│   ├── package.json        # Extension manifest, settings, sidebar views
│   ├── extension.js        # PTY mirror terminals, gutter decorations, webviews
│   ├── resources/          # Gutter decorator icons and assets
│   └── zaf-control-2.0.0.vsix  # Packaged extension (install from VSIX)
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs         # Rust app launcher
│       └── lib.rs          # Tray, minimize-to-tray, notifications
└── WIP/
    ├── tickets/            # ACTIVE/, OPEN/, BLOCKED/, DONE/, TICKETS.md
    └── programmes/         # Programme goal documents
```

---

## Quick Start

### Requirements

- [Node.js](https://nodejs.org/) v18 or higher
- npm

Rust/Cargo is only needed if building the Tauri desktop app from source.

### 1. Install dashboard dependencies

```bash
cd dashboard
npm install
```

### 2. Start the control server

```bash
node dashboard/server.js
# Server starts on http://localhost:4242
```

Open `http://localhost:4242` in a browser to access the dashboard.

### 3. ZAF CLI usage

```bash
# Show help
node cli/zo.js

# Query ticket status
node cli/zo.js ticket status TKT-ZAF-0005

# Create a new ticket
node cli/zo.js ticket create "Implement database auth schema"

# Launch an agent harness
node cli/zo.js run engineering --ticket TKT-ZAF-0006 --harness mock

# Launch with Claude Code harness
node cli/zo.js run engineering --ticket TKT-ZAF-0007 --harness claude-code
```

### 4. Run the test suite

```bash
node cli/test-harness.js
```

### 5. VSCode Extension

Install `extension/zaf-control-2.0.0.vsix` from the Extensions panel. See [docs/EXTENSION-GUIDE.md](docs/EXTENSION-GUIDE.md) for the full setup guide.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Control server | Node.js, `chokidar`, `gray-matter`, PTY (node-pty) |
| Dashboard frontend | Vanilla HTML5 / CSS3 / ES6, xterm.js, marked.js |
| Visualisations | Pure-JS force-directed SVG (no graph framework dependencies) |
| Desktop shell | Rust, Tauri v2, `tauri-plugin-notification` |
| IDE extension | VSCode Extension API, JavaScript, xterm.js |

---

## License

MIT — see LICENSE file for details.

## Author

**Enzo Terrier** — [@nassau-1](https://github.com/nassau-1)
