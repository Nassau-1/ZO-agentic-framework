# Roadmap

This file lists planned improvements for ZAF. The README keeps a short summary; this file holds the detailed view.

## Near-term

- Cleaner onboarding flow. A first-run wizard that bootstraps `WIP/` and a default agent config.
- Packaged desktop release. Signed Tauri builds for Windows, macOS and Linux.
- Examples and demo project. Expand `examples/demo-project/` with multi-ticket scenarios.
- Improved custom harness configuration. UI editor for harness binary, arguments, env vars and TTY requirements.
- Richer screenshots and demo videos. Replace the placeholders in `assets/screenshots/` once the dashboard layout is stable.
- Documented agent pack format. Reference docs for Format A (`.md` frontmatter) and Format B (`agents.json`).
- Clearer production hardening notes. Operator guidance for running ZAF on a multi-user host.

## Medium-term

- Pluggable storage adapters for tickets and audit logs while keeping the file system as the default source of truth.
- First-class permissions model for agent write boundaries beyond per-role directory mounts.
- Reusable skill catalogue with versioning across projects.
- Programme-level metrics: throughput, blocker churn, average time-in-status by phase.

## Longer-term

- Cross-machine fleet view for operators running ZAF on multiple hosts.
- Optional self-hosted aggregation layer for teams that want a shared dashboard while keeping data on their own infrastructure.
