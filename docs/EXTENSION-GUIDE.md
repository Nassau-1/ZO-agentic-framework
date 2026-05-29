# ZAF Control VSCode Extension - User Guide

Extension: `zaf-control` v2.1.0
File: `<repo>/extension/zaf-control-2.1.0.vsix`

---

## 1. Installation

1. Open VSCode.
2. Open the Extensions panel (`Ctrl+Shift+X`).
3. Click the `⋯` menu (top-right of the panel).
4. Select **Install from VSIX...**.
5. Navigate to `<repo>/extension/zaf-control-2.1.0.vsix` and select it.
6. Reload VSCode when prompted.

The ZAF sidebar icon appears in the Activity Bar after reload.

---

## 2. First-Time Setup

The extension connects to the ZAF sidecar server over HTTP. The server must be running before using any extension features.

Start the server manually:

```bash
node dashboard/server.js
```

Confirm it is running - the terminal should print:

```
ZAF control server listening on port 4242
```

Open `http://localhost:4242` in a browser to verify the dashboard loads. Once the server is confirmed, the extension sidebar will populate automatically.

---

## 3. Sidebar Panels

Press `Ctrl+Alt+Z` or click the ZAF icon in the Activity Bar to open the sidebar. Three panels are available:

### Board

Displays all tickets from `WIP/tickets/`, grouped by state: OPEN, ACTIVE, BLOCKED, DONE. Each ticket card shows the ticket ID, title, assigned agent, and current state.

Use the Board to:
- Get a quick kanban view of programme work without leaving the editor.
- Launch an agent directly from a ticket card (see section 4).
- Click a ticket to open its detail panel showing the full Handoff Log and acceptance criteria.

The Board polls the sidecar server and refreshes automatically when ticket state changes.

### Active Shells

Lists all agent subprocesses currently running under the sidecar. Each entry shows the process ID, harness type, associated ticket ID, and elapsed runtime.

From this panel you can:
- See which agents are live at a glance.
- Open a PTY mirror terminal for any shell (see section 5).
- Kill a subprocess directly from the panel.

### Audit Log

Streams the JSONL audit log from the sidecar in real time. Events are colour-coded by type: `agent.start`, `agent.stop`, `agent.loop`, `skill.extracted`, `ticket.updated`, and others.

Use the search box at the top of the panel to filter by event type or ticket ID.

---

## 4. Launching an Agent from a Ticket

In the **Board** panel:

1. Find the ticket you want to work on.
2. Click the **▶ Launch** button on the ticket card.
3. A dialog appears asking you to confirm the harness. The default harness is set by `zaf.defaultHarness` (see section 8). Change it if needed.
4. Click **Confirm**. The sidecar spawns the agent subprocess, and a new entry appears in **Active Shells**.

The launched agent receives an auto-generated seed prompt that includes the ticket goal, acceptance criteria, scope boundaries, and (if available) the `CODEBASE.md` context document.

---

## 5. PTY Mirror

The PTY mirror opens a native VS Code terminal that shows a live replay of the agent's PTY output stream.

To open a mirror:

1. Go to the **Active Shells** panel.
2. Find the shell you want to observe.
3. Click **⬛ Mirror PTY** on that entry.

A new VS Code terminal tab opens named after the process ID and ticket. Output from the agent is streamed in real time. The mirror is read-only - it reflects the agent's actual PTY output but does not send input to the process.

If the terminal opens blank, see Troubleshooting section 11.

---

## 6. Gutter Decorations

ZAF places a small icon in the editor gutter on lines of files that are referenced in active ticket files.

A file is "referenced" when its path appears inside backtick code spans in a ticket under `WIP/tickets/ACTIVE/`. For example, if a ticket contains `` `src/auth/session.ts` ``, any open editor showing `src/auth/session.ts` will display the gutter icon on the line nearest the top of the file (or on the specific line number if specified in the ticket).

**Hover** over the gutter icon to see a tooltip showing the ticket ID and title.

**Click** the gutter icon to open the ticket detail panel in the sidebar.

This makes it immediately visible which files are in scope for active work, without switching context to the dashboard.

---

## 7. Keyboard Shortcut

| Shortcut | Action |
|---|---|
| `Ctrl+Alt+Z` | Toggle the ZAF sidebar open/closed |

No other default shortcuts are registered. Additional keybindings can be added via the standard VSCode keybindings editor (`Ctrl+K Ctrl+S`).

---

## 8. Settings

Open settings with `Ctrl+,` and search **ZAF** to find all extension settings.

| Setting | Default | Description |
|---|---|---|
| `zaf.sidecarUrl` | `http://localhost:4242` | URL of the ZAF sidecar server. Change this to connect to a remote ZAF instance. |
| `zaf.autoStartSidecar` | `false` | If `true`, the extension attempts to start `node dashboard/server.js` automatically when VSCode opens. Requires the workspace to be opened at the repo root. |
| `zaf.defaultHarness` | `mock` | Default harness pre-selected in the Launch dialog when starting an agent from a ticket card. |

---

## 9. Auto-Start Sidecar

To avoid manually running `node dashboard/server.js` each time:

1. Open Settings (`Ctrl+,`).
2. Search `zaf.autoStartSidecar`.
3. Set it to `true`.

When enabled, the extension spawns the sidecar process in the background on VSCode startup. The process is tied to the VSCode window - it stops when the window closes. Output from the auto-started sidecar is visible in the **Output** panel (`Ctrl+Shift+U`) under the **ZAF Sidecar** channel.

Note: auto-start only works when the VSCode workspace root contains `dashboard/server.js`. If you open VSCode in a subdirectory or an unrelated folder, auto-start will silently skip.

---

## 10. Remote Server

To connect to a ZAF instance running on another machine:

1. Open Settings (`Ctrl+,`).
2. Set `zaf.sidecarUrl` to the remote server address, for example:
   ```
   http://192.168.1.50:4242
   ```
3. The extension will use that URL for all API calls and SSE connections.

The remote server must have CORS headers configured to allow connections from `vscode-webview://` origins. If the Board panel shows a connection error, check the server's CORS configuration.

PTY mirror terminals work over a remote connection as long as the sidecar's `/api/process/stream?id=<id>` and `/api/process/buffer?id=<id>` endpoints are reachable.

---

## 11. Troubleshooting

### Board shows no tickets

- Confirm the sidecar is running: open `http://localhost:4242` (or your configured `zaf.sidecarUrl`) in a browser. If the dashboard does not load, the server is not running - start it with `node dashboard/server.js`.
- Check that ticket files exist under `WIP/tickets/ACTIVE/` or `WIP/tickets/OPEN/`. An empty TICKETS.md or empty subdirectories will result in an empty Board.

### PTY mirror terminal opens blank

- The mirror fetches buffered output from `GET /api/process/buffer?id=<process-id>`. Open that URL in a browser directly. If it returns an empty body or 404, the process either has not produced output yet or has already been cleaned up.
- Check that the process is still listed as running in the Active Shells panel. Completed processes retain their buffer for a short window; after that the buffer is flushed.

### No gutter icons appearing

- Check that the ticket files referencing the current file are in `WIP/tickets/ACTIVE/` - gutter decorations are only generated for **ACTIVE** tickets, not OPEN or BLOCKED.
- Confirm that file paths inside the ticket are wrapped in backticks. Plain text paths are not parsed. Example of a correctly formatted reference: `` `src/auth/session.ts` ``.
- Reload the window (`Ctrl+Shift+P` → **Developer: Reload Window**) to force a re-scan of active tickets.

### Extension sidebar does not appear after install

- Confirm VSCode was reloaded after installing the VSIX.
- Check the Extensions panel to confirm `zaf-control` appears in the installed list and is enabled.
- Open the Output panel (`Ctrl+Shift+U`) and select **ZAF** from the channel dropdown to see any startup errors.
