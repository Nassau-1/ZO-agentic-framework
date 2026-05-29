# Programme Planner — Design Note

Status: design draft for TKT-ZAF-0053. Not implemented.

## Problem

Today a ticket is dispatched to a single agent with everything pre-set by the operator: harness,
model, role, scope. There is no path from "operator has a goal" → "fan-out across the right teams
and the right agents, with dependency edges between the resulting tickets." Operators have to do
that decomposition manually, which scales poorly past one programme.

## What exists today

A scan of `01_Repos/zaf/` for prior decomposition surfaces finds:

- `WIP/programmes/` — a directory for programme manifests. Currently one entry: `PROG-ZAF-001`.
  Programme manifests today are descriptive (title, scope), not generative.
- `dashboard/server.js → /api/programme/create` — creates a programme entry but does not generate
  tickets under it.
- `dashboard/parse.js` — builds the cross-repo programme tree shown on the dashboard.
- Agent Builder `STRUCTURAL_PERSONAS_BUILTIN` — defines `thinker` (planner) as a real persona with
  bounds. No code path currently maps a thinker to "decompose this goal into tickets."
- `04_Agents/` (workspace governance) — historical agent org from before the 2026-05-26
  authority migration. Has COO/team-lead role definitions that an MVP could lean on.

So: programme containers exist, but ticket generation from a programme goal is missing.

## What a Programme Ticket is

**Input schema** (operator-supplied or upstream):

```yaml
programmeId:   PROG-ZAF-NNN
goal:          "Free-text statement of what this programme should achieve."
constraints:
  budget:      { tokens: 500_000, runtimeHours: 12 }
  forbidden:   ["touch production DB", "rewrite auth"]
  must_use:    ["existing CLI hub", "claude-code harness"]
target_repo:   zaf
deadline:      2026-06-15      # ISO date or null
approval_gate: yes             # tickets land in DRAFT until operator approves
```

**Output schema** (what the planner emits, before tickets are written to disk):

```yaml
programmeId: PROG-ZAF-NNN
plan_version: 1
tickets:
  - id: PROPOSED-1
    title: "..."
    team: engineering
    role: thinker
    priority: P1
    scope: "Files/areas to touch"
    acceptance: ["AC1", "AC2"]
    depends_on: []
    estimated_tokens: 30000
  - id: PROPOSED-2
    ...
edges:
  - { from: PROPOSED-1, to: PROPOSED-2, kind: blocks }
risks: ["risk 1 …"]
recovery_plan: "If PROPOSED-3 returns BLOCKED, switch to PROPOSED-3a (defined below) …"
```

The operator approves or rejects the plan **before** any `PROPOSED-N` becomes a real `TKT-ZAF-XXXX`.
On approval, ZAF mints real ticket IDs and writes them to `WIP/tickets/ACTIVE/`.

## Architectures compared

### A. Centralised planner

One CEO-tier agent reads the goal, the full agent roster (`config.agents`), all structural roles
(`getStructuralPersonas()`), and recent programme outcomes (audit log + ARCHIVED/ tickets), then
emits the full plan in a single pass.

| Property            | Reading                                                               |
| ---                 | ---                                                                   |
| Token cost          | High at the planning step (must serialise roster + goals + history)   |
| Latency             | One long call. Predictable. Easy to monitor.                          |
| Accuracy            | Strong on global structure (sees the whole org). Weak on team-specific tacit knowledge. |
| Recovery from bad plan | Replan globally. Cheap to retry but loses any partial good plan.   |
| Implementation cost | Lowest: one agent class, one prompt.                                  |

### B. Federated planner

A CEO agent maps the goal to a set of teams, then dispatches per-team COO agents who each plan
within their team's scope. CEO collates the sub-plans, resolves cross-team dependencies, and
presents the merged plan.

| Property            | Reading                                                               |
| ---                 | ---                                                                   |
| Token cost          | More calls, but each is smaller (team-scoped roster). Often LOWER total. |
| Latency             | Higher (sequential CEO→COO calls) unless parallelised across teams.   |
| Accuracy            | Stronger on team-specific scope. Risk of cross-team dependency misses unless CEO collation is robust. |
| Recovery from bad plan | Replan only the affected team. Cheap partial replans.              |
| Implementation cost | Higher: CEO orchestration + per-team COO prompts + a merge step.      |

### Recommendation

**Start with A (centralised) for the MVP**, with a clear migration path to B once the catalogue
of programmes grows past ~5 active and the team boundaries are stable. Rationale:

1. Centralised is the smallest change to the existing seed-prompt + spawn pipeline. Reuses
   `composeSeedPrompt`, no new orchestration layer.
2. The token-efficiency claim for B depends on team boundaries being clean and team rosters being
   small. With today's `config.agents` (≈ a dozen entries) the centralised call fits easily into
   one Opus context.
3. The recovery argument for B kicks in mainly when plans cost real money. At MVP scale, a full
   replan is cheap.
4. Migration to B later is mechanical: extract the per-team plan section of the centralised prompt
   into a per-team subroutine.

## Planner-agent access requirements

To emit a sane plan, the planning agent needs:

- **Roster:** `config.agents` enumerated by team (via `config.org.teams[].members`).
- **Roles:** `getStructuralPersonas()` so it knows which structural roles exist and what each can/cannot do.
- **CLI capabilities:** the per-harness model list and reasoning-effort capability (already
  exposed via `/api/cli/discover` + `REASONING_CAPABILITY`).
- **Prior outcomes:** the last N ARCHIVED tickets per team, summarised, plus the relevant audit
  events. A `/api/planner/context` endpoint should assemble this in a token-budget-aware way.
- **Forbidden / must-use lists:** straight from the input schema.

## MVP scope

The MVP IS: a new dashboard view "Programme Planner" with a goal input box + constraints panel +
"Generate plan" button. Generation calls a new server endpoint `/api/programme/plan` that:

1. Composes the centralised planner prompt.
2. Spawns a one-shot `claude-code` agent with structural role `thinker` and reasoning `high`.
3. Captures the structured plan output (YAML or JSON block in the response).
4. Returns the parsed plan to the dashboard.

The dashboard renders the plan tree with per-ticket checkboxes ("approve / reject"). Approved
tickets are written via the existing `/api/ticket/create` flow with proper IDs and `blocks` /
`blocked_by` edges.

Out of scope for MVP: federated planning, token-budget tracking inside the planner, plan
re-generation after partial execution.

## Follow-on implementation tickets (to be opened on operator approval of this design)

| Proposed ID  | Scope                                                                              |
| ---          | ---                                                                                |
| TKT-ZAF-PP-1 | New `/api/planner/context` endpoint assembling roster + roles + caps + outcomes    |
| TKT-ZAF-PP-2 | New `/api/programme/plan` endpoint: compose prompt, spawn planner agent, capture plan |
| TKT-ZAF-PP-3 | Programme Planner dashboard view: goal input, constraints, plan tree, approve gate |
| TKT-ZAF-PP-4 | Approval flow: write approved tickets via /api/ticket/create with dependency edges |
| TKT-ZAF-PP-5 | Plan replay: store plan JSON next to the programme so reruns are auditable         |

(IDs above are placeholders. Real ticket IDs will be assigned at file-creation time.)

## Open questions

- Should the planner write a Programme Manifest alongside the tickets, or assume the manifest
  already exists?
- What is the operator-side override UX when the planner produces a plan with edges the operator
  disagrees with? (Drag-edit the tree, or reject and replan?)
- Token-budget visibility — surface estimated tokens per ticket before approval?
