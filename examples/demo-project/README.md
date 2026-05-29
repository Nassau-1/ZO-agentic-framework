# ZAF demo project

This is a minimal demo project for ZAF, the Zero-to-one Agent Framework.

It exists to demonstrate the end-to-end flow with the `mock` harness, with no API keys or external CLIs required.

## What you get

- One open ticket under `WIP/tickets/OPEN/DEMO-001-first-agent-run.md`
- A project that can be opened by the ZAF dashboard as a workspace
- A run that exercises ticket loading, mock telemetry, audit log and skill extraction

## How to run

From the root of the ZAF repository:

```bash
npm start
```

Then open `http://localhost:4242` in your browser and point the dashboard at the `examples/demo-project/` directory.

From the CLI:

```bash
node ../../cli/zaf.js run engineering --ticket TKT-ZAF-0001 --harness mock
```

The mock harness streams synthetic telemetry into the dashboard so you can see ticket selection, role binding, audit events and skill extraction working end-to-end without any external dependencies.

## Notes

- This demo does not call Claude Code, Codex or Gemini CLI.
- No API keys are required.
- The demo ticket is safe to copy into your own workspace and adapt.
