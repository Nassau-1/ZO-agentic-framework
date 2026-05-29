# ZAF Persistence Map

Audit of every persistent and ephemeral state surface in the ZAF runtime. Produced for TKT-ZAF-0056.

Last audited: 2026-05-29 against commit `a1b3fb1`.

## Storage surfaces

| Entity                       | Where it lives                                                       | Lifecycle       | Tracked in git?         | Backup status                          |
| ---                          | ---                                                                  | ---             | ---                     | ---                                    |
| Agent definitions            | `dashboard/config.json` → `agents`                                   | Persistent      | Yes (committed)         | Covered by git                         |
| Org / teams                  | `dashboard/config.json` → `org.teams[]` + `org.layout`               | Persistent      | Yes                     | Covered by git                         |
| Marketplace import state     | `dashboard/config.json` → `importedPacks[]` + `agents[*].source`     | Persistent      | Yes                     | Covered by git                         |
| Marketplace defaults         | `dashboard/config.json` → `marketplaceDefaults`                      | Persistent      | Yes                     | Covered by git                         |
| Custom harnesses             | `dashboard/config.json` → `customHarnesses[]`                        | Persistent      | Yes                     | Covered by git                         |
| Git / GitHub config          | `dashboard/config.json` → `github` (PAT scrubbed on GET)             | Persistent      | Yes (PAT NOT scrubbed on disk — see follow-up) | Covered by git (PAT leak risk) |
| Registered repos             | `dashboard/config.json` → `repos[]` (incl. imported repos via 0055)  | Persistent      | Yes                     | Covered by git                         |
| Tickets (active)             | `01_Repos/<repo>/WIP/tickets/ACTIVE/TKT-*.md`                        | Persistent      | `WIP/` gitignored — survives reboots, NOT git ops | Local only          |
| Tickets (archived)           | `01_Repos/<repo>/WIP/tickets/ARCHIVED/TKT-*.md`                      | Persistent      | `WIP/` gitignored       | Local only                             |
| Ticket index                 | `01_Repos/<repo>/WIP/tickets/TICKETS.md`                             | Persistent      | `WIP/` gitignored       | Local only                             |
| Audit log                    | `dashboard/audit-log.jsonl` (append-only)                            | Persistent      | Gitignored              | Local only — needs backup              |
| Agent run captures           | `dashboard/runs/*.prompt.md` + `*.output.*`                          | Persistent      | Gitignored              | Local only — needs backup              |
| Parse snapshot               | `dashboard/data.json` (and `dashboard/dist/data.json`)               | Derived / regen | Gitignored              | Reproducible — no backup needed        |
| Sidecar / server logs        | `dashboard/sidecar.log`, `dashboard/server.log`                      | Ephemeral-ish   | Gitignored              | Rotate; backup optional                |
| PTY processes                | In-memory `processes` Map (`server.js`)                              | EPHEMERAL       | n/a                     | Lost on restart — by design            |
| SSE clients                  | In-memory `sseClients` Set                                           | EPHEMERAL       | n/a                     | Lost on restart — by design            |
| Heartbeat retry counters     | In-memory inside `processes.get(id).meta`                            | EPHEMERAL       | n/a                     | Lost on restart — paused runs orphan   |
| CLI hub status cache         | In-memory `STATE.cliHubStatus` (browser)                             | Per-session     | n/a                     | Re-probed on page load                 |
| Model probe cache            | In-memory `probedModelsCache` (browser, per Agent Builder mount)     | Per-session     | n/a                     | Re-probed on harness change            |

## Read/write entry points

| Operation                      | Read                              | Write                                                          |
| ---                            | ---                               | ---                                                            |
| Config                         | `readConfig()` → `CONFIG_FILE`    | `writeConfig(conf)` — mirrors to `dashboard/dist/config.json`  |
| Audit log                      | `auditRead(limit)`                | `auditAppend({kind, ...})` — broadcasts SSE `audit` event too  |
| Tickets                        | `parse.js` walks `01_Repos/*/WIP` | Ticket creation/update via `/api/ticket/*` writes the `.md` directly |
| Runs                           | `dashboard/runs/` dir listing     | `spawnAgent()` writes `<run>.prompt.md`; PTY captures output    |

## Gaps and follow-ups

1. **PAT plaintext on disk.** `config.json` is committed, and `conf.github.pat` is stored unencrypted; only the GET endpoint scrubs it. If the dashboard config is ever committed with a PAT set, the token leaks into git history. Recommended follow-up: store `github.pat` in OS keychain or under `02_Runtime/gordon-prod/.env`-style secret file and reference by env var. **Filed as TKT-ZAF-0058** (new ticket — see TICKETS.md next slot).
2. **WIP/ tickets not under git.** Per workspace rule `WIP/` is gitignored. That means the source of truth for tickets is local-only on T418. Any T418 reimage destroys ticket state. Per CLAUDE.md `04_Agents/` and `00_Standards/` are mirrored via `01_Repos/Codex/` — there is no equivalent mirror for `01_Repos/zaf/WIP/`. **Filed as TKT-ZAF-0059** (new ticket — see TICKETS.md next slot).
3. **Paused / rate-limited PTY runs orphan on restart.** The heartbeat sweeper in `server.js` walks the in-memory `processes` Map. If the server restarts while runs are paused-for-rate-limit, the retry schedule is lost and the runs never resume. Recommended: persist process meta (status, retryCount, pausedAt) into config on each transition and rehydrate on boot. **TKT-ZAF-0057 (Backup policy)** is adjacent — handled separately.
4. **Logs (audit-log.jsonl, runs/) not backed up.** These are gitignored. Without a rotational backup they grow unbounded and are lost on disk failure. Addressed by **TKT-ZAF-0057 (Backup policy)**, which was already blocked_by this ticket.

## Workspace-rule alignment note

Per `c:\Users\LENOVO\Workspace\CLAUDE.md`, "live `.env` files, TLS material, SSH keys, logs, and mutable runtime state" should live in `02_Runtime/`. ZAF deliberately keeps `config.json`, `audit-log.jsonl`, and `runs/` inside the repo (`dashboard/`) so the dashboard is portable to other operators / machines. This is a documented design trade-off, not an oversight: `audit-log.jsonl` and `runs/` are gitignored so they don't leak between machines, while `config.json` is intentionally checked in so the agent/team configuration ships with the repo. A future ticket can revisit whether secrets like `github.pat` should be moved out per the runtime rule.
