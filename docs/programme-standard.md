# ZAF Programme Standard

This document outlines the architectural standards, gatekeeping mechanisms, and operational schemas for high-level **Programmes** within the **ZO Agentic Framework (ZAF)**. 

Programmes serve as the strategic blueprints governing multi-repo operations and directing active workstreams over long-term development lifecycles.

---

## 📂 Programme File Schema

All programmes are defined inside a single markdown file at `WIP/programmes/PROGRAMME-[ID].md`. Like tickets, they are structured to be easily parsed by the system parser (`parse.js`) and consumed by the visualizer.

### Standard Template:
```markdown
# PROGRAMME-XYZ-001 — [Title of Programme]

**Owner**: [User Name]  
**COO**: [Orchestrator Role]  
**Created**: YYYY-MM-DD  
**Status**: ACTIVE — Phase [N] (Current Focus Area)

---

## Programme Goal

[Description of high-level goals and what the initiative accomplishes across the workspace repositories.]

---

## Programme Non-Negotiables

1. [Core rule 1]
2. [Core rule 2]

---

## Phases and Gates

### Phase 0 — [Phase 0 Title] ✓ COMPLETE (YYYY-MM-DD)

**Objective**: [Objective statement]

**Work items**:
- [ ] Task 1
- [ ] Task 2

**Gate**: [Acceptance gate verification metrics] ✓

---

### Phase 1 — [Phase 1 Title] ← ACTIVE

**Objective**: [Objective statement]

**Work items**:
- [ ] Task 1
- [ ] Task 2

**Gate**: [Acceptance gate verification metrics]

---

### Phase 2 — [Phase 2 Title] (PENDING Phase 1 gate)

**Objective**: [Objective statement]

**Work items**:
- [ ] Task 1

**Gate**: [Acceptance gate verification metrics]

---

## Workstreams

### WS-DASHBOARD — Dashboard Tooling
**Goal**: [Goal description]  
**Current state**: [Active state summary]

---

## Open Questions

| ID | Question | Blocks | Status | Answer |
|---|---|---|---|---|
| OQ-001 | [Specific question description] | TKT-001 | OPEN | [Answer text if answered] |
```

---

## 🚧 Phase Gates & Transition Rules

A **Phase Gate** is an explicit verification boundary that separates development phases. ZAF enforces structural constraints to prevent "gate-skipping":

1.  **Blocker Enforcement**: The central parser (`parse.js`) and the COO agent read the gate declarations. If a phase is marked `(PENDING Phase [N] gate)`, all tickets marked under that phase's work items are automatically blocked by the unresolved gate.
2.  **Gate Closure Protocol**: To close a gate and transition a phase to `✓ COMPLETE`:
    *   All tickets tagged with the active phase's ID must have status `status: DONE` and be moved to the `ARCHIVED/` folder.
    *   The Programme document's phases section is updated to reflect completion.
    *   The next pending phase is marked `← ACTIVE` and its ticket dependencies are automatically unblocked.

---

## ❓ The Open Questions (OQ) Protocol

Complex agent systems frequently encounter ambiguities, architectural gaps, or policy questions. The **Open Questions (OQ) Protocol** is ZAF's native mechanism for resolving these blocks:

### 1. Structure of an OQ
An Open Question consists of:
*   **`ID`**: Globally unique query ID (e.g., `OQ-001`).
*   **`Question`**: A clear, specific question addressed to the human operator or team leads.
*   **`Blocks`**: The specific ticket ID or task that cannot proceed until this question is answered.
*   **`Status`**: Either `OPEN` or `**ANSWERED**`.
*   **`Answer`**: Detailed resolution text providing the policy, configuration, or architectural decision.

### 2. Lifespan of an OQ
```
[ Blocker Discovered ] ──► [ COO Creates OQ-001 ] ──► [ Ticket Marked BLOCKED ]
                                                             │
                                                             ▼
[ Ticket Unblocked ] ◄─── [ Answer Recorded ] ◄─── [ Human Operator Resolves OQ ]
```

### 3. Resolution Hygiene
*   Agents are permitted to discover and log Open Questions.
*   **Only human operators** or designated delegate coordinator agents can mark an OQ as `**ANSWERED**` and write the resolution.
*   Once answered, the COO automatically unblocks all tickets listed in the `Blocks` column.
