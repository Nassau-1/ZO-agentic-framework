# ZO.AF: from Zero to One Agentic Framework

> **The Control Plane for "Zero to One" (ZO.AF) Autonomous & Multi-Agent Teams.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Local First](https://img.shields.io/badge/Local--First-Yes-brightgreen)](#)
[![Stack: Node.js / Vanilla JS](https://img.shields.io/badge/Stack-Node.js%20%2F%20Vanilla%20JS-blue)](#)

Zero to One Agentic Framework (ZO.AF) is a self-hosted, local-first agentic operating system designed to coordinate, run, and visualize teams of autonomous AI agents. Rather than treating agents as simple chatbot conversation partners, ZO.AF establishes a structured control plane—treating agents as scheduled employees with defined roles, clear goal alignment, and deep directory-aware dependency tracking.

This repository contains the core visualiser, parser, and native live-telemetry server for ZO.AF.

---

## ◈ Core Philosophy: From Zero to One (ZO.AF)

Current AI agent frameworks often struggle to scale beyond single-turn inputs or isolated scripts, resulting in runaway costs or "agent drift" (doing busywork instead of the target goal). 

ZO.AF operates on a different set of assumptions:
1. **Agents as Employees**: Agents have specific roles (e.g., SRE, Sourcing, Intelligence, Design), defined skillsets, and scheduled heartbeats.
2. **Directory-First State**: Your filesystem is the database. State, ticket definitions, and logs are kept in markdown-based task directories, preventing vendor lock-in.
3. **Goal-Aware Dependency Graph**: Tasks have clear goal ancestries. Blockers and edges are mapped so agents understand the *why* and *what* of their work and never run out of sync.

---

## ⊞ Core Features (Current Release)

### 1. Standalone Multi-Repo Auto-Discovery
ZO.AF does not rely on a heavy database to monitor your organization. Instead, the native parser (`parse.js`) dynamically scans your development space (`01_Repos/`) to auto-discover active projects, scheduled tasks, and agent programs on the fly. 

### 2. SSE Live Telemetry Control Server
A lightweight, zero-dependency Node.js control server (`server.js`) handles HTTP requests and establishes a persistent **Server-Sent Events (SSE)** telemetry stream. The server:
* Monitors directory changes across all your repositories in real-time.
* Pushes instant hot-reload signals to connected browsers.
* Ensures the dashboard updates in **under 1 second** of any ticket or state change.

### 3. Draggable & Pinnable Dependency Graph
An Obsidian-inspired, force-directed SVG engine maps out all dependency relationships (`blocks` and `blocked_by`) across your teams.
* **Interactive Pan & Zoom**: Scroll wheel zooms around cursor; drag background to pan.
* **Node Dragging**: Click and grab nodes to manually organize layouts.
* **Persistent Node Pinning**: Dragged nodes stay exactly where you place them (pinned) to let you design custom layouts, while remaining nodes dynamically adapt around them. Double-click releases them back to the spring layout.
* **Live Bezier Edge Routing**: Edges update smoothly in real time during drag events.

### 4. Interactive Kanban Control Board
A unified, high-performance SPA dashboard:
* Unified or single-repo view toggles.
* Filters tasks by Workstream, Phase, Priority, Status, and Search Query.
* Ticket detail panel renders full markdown descriptions, status badges, and interactive dependency chips.

---

## 📂 Repository Structure

```
zo-agentic-framework/
├── .gitignore            # Ignores generated data.json, node_modules, and internal WIP tracking
├── README.md             # This document
└── dashboard/            # Standalone visualizer & control server
    ├── server.js         # Native HTTP & SSE telemetry server
    ├── parse.js          # File-based multi-repo task parser
    ├── app.js            # Frontend SPA logic (routing, interactive graph, SSE listener)
    ├── style.css         # Premium Linear-inspired dark design system
    ├── index.html        # App shell markup
    └── package.json      # Node.js dependencies (gray-matter, chokidar, marked)
```

---

## ⚡ Quick Start

### 1. Requirements
* [Node.js](https://nodejs.org/) (v18 or higher)
* NPM

### 2. Installation
Clone the repository and install the dependencies for the dashboard:
```bash
cd dashboard
npm install
```

### 3. Running the Server
Start the local server:
```bash
npm start
# or: node server.js
```
The server will start on port `4242` and begin watching the workspace directories for updates.

### 4. Visualizing Your Team
Open your browser and navigate to:
```
http://localhost:4242
```

---

## 🛠 Tech Stack
* **Backend**: Node.js, `chokidar` (file system watcher), `gray-matter` (front-matter parser)
* **Frontend**: Vanilla HTML5, CSS3 Custom Properties (CSS variables), Vanilla ES6 JavaScript
* **Visualizations**: Direct SVG elements rendered on a native canvas (no heavy graph frameworks needed)
* **Markdown Rendering**: `marked.js`

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author
**Enzo Terrier**
* GitHub: [@nassau-1](https://github.com/nassau-1)
