---
id: DEMO-001
title: First agent run with the mock harness
status: OPEN
programme: PROG-DEMO-001
workstream: WS-DEMO
phase: P0
priority: P1
project: ZAF demo
repo: demo-project
team: engineering
roles: [engineering]
archetype: BUILD
blocks: []
blocked_by: []
created: 2026-05-29
updated: 2026-05-29
usage_checkpoint: LOW
---

## Context

This is the first ticket in the ZAF demo project. It exists so a new user can run an agent end-to-end without configuring any external CLI or API key.

## Task

1. Launch the ZAF dashboard.
2. Point the dashboard at this project directory.
3. Run the `mock` harness against this ticket.
4. Observe synthetic telemetry, audit events and skill extraction.

## Acceptance criteria

- [ ] Dashboard surfaces this ticket in the Board view.
- [ ] Mock harness runs to completion without errors.
- [ ] Telemetry appears in the Fleet view.
- [ ] A handoff log entry is appended below.

## Handoff Log

- 2026-05-29 | operator | OPEN. Ticket created for the demo project.
