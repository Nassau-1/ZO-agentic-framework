# Changelog

This file collects notable changes to ZAF. Dates use the `YYYY-MM-DD` format.

## Unreleased

- Renamed the project from `ZO.AF` / `ZOAF` (`Zero to One Agentic Framework`) to `ZAF` (`Zero-to-one Agent Framework`).
- Renamed the CLI entrypoint from `cli/zo.js` to `cli/zaf.js`. `cli/zo.js` remains as a thin backwards-compatibility wrapper.
- Renamed the npm package from `zo-agentic-framework` to `zaf`. Bin entry is now `zaf`.
- Renamed the VSCode extension display name to `ZAF Control`.
- Added the ZAF ASCII banner to the CLI help output and the README header.
- Reworked the README as a public product page. Moved internal architecture detail into `docs/ARCHITECTURE.md`.
- Added `docs/QUICKSTART.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` and `docs/TICKET-STANDARD.md`.
- Added `assets/screenshots/` with a `.gitkeep` placeholder.
- Added a minimal `examples/demo-project/` runnable with the `mock` harness.

## 3.0.0

- Initial public-readiness release base. Control server, dashboard SPA, CLI harness runner, Tauri desktop wrapper and VSCode extension consolidated under a single repository.
- Added codebase map static analysis with `CODEBASE.md` generation.
- Added agent loop detector with auto-kill option.
- Added session skill extractor with `.zaf-skills/` persistence.
- Added agent marketplace import flow.
