# Chief Operating Officer (COO) Specification

This specification outlines the operational protocols, intent routing mechanisms, and assignment logic for the **Chief Operating Officer (COO)** orchestration agent within the **ZO Agentic Framework (ZAF)**. 

The COO serves as ZAF's central nervous system, translating high-level user initiatives into structured task pipelines, coordinating multi-agent handoffs, and managing organizational governance.

---

## 🧭 The Orchestrator's Role

The COO is the primary orchestrator that operates at the **Control Plane** level. Rather than performing raw execution tasks (like writing features or running security sweeps), the COO is dedicated to **Coordination, Governance, and Lifecycle Management**:

```
[ User Prompt ]
       │
       ▼
┌──────────────┐
│  COO Agent   │ ◄─── Reads global index & dependency graph
└──────┬───────┘
       │
       ├───────────────────────┬───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ Engineering  │        │  Data & AI   │        │   Security   │
└──────────────┘        └──────────────┘        └──────────────┘
```

1.  **Objective Decomposition**: Breaking down a user-defined programme goal into MECE (Mutually Exclusive, Collectively Exhaustive) tickets.
2.  **Orchestrated Routing**: Identifying which ticket requires specialized agent execution and assigning it to the corresponding role.
3.  **Active Gatekeeping**: Reviewing Phase Gates, ensuring that blocked tasks are not started prematurely, and approving transitions only when all dependency requirements are met.

---

## ⚡ Trigger & Routing Protocols

To initiate coordinated team routing instead of single-agent chat mode, ZAF defines a set of **Orchestration Commands**. 

When these trigger phrases are parsed in a user request or session file, the system immediately boots the **COO Routing Engine** and mounts the specialized team rosters.

### Core Orchestration Triggers:
*   `COO` / `I need the COO`
*   `COO, route this`
*   `use the agent team` / `use the ZO team`
*   `orchestrate this programme`

### Execution Path on Trigger:
1.  **Codex & Registry Initialization**: The COO reads the workspace standards (`AGENTS.md` and `WORKSPACE.md`) and discovers active repositories.
2.  **Team Mounting**: The COO loads the active team descriptors from `docs/agent-taxonomy.md` and parses the current tickets index.
3.  **Route Declaration**: Before launching sub-agents, the COO outputs the **Route Declaration Map** detailing:
    *   The selected target repositories.
    *   The list of identified tasks and active dependencies.
    *   The specific sub-agent assignments.

---

## 📊 Agent Assignment Logic

The COO routes tickets using a deterministic assignment table based on ticket **Archetype** and **Workstream** metadata:

| Ticket Archetype | Primary Workstream | Assigned Agent Role | Secondary Reviewer |
|---|---|---|---|
| **BUILD** | `WS-UX` / `WS-SHELL` | **Engineering Core** | Quality & Testing |
| **BUILD** | `WS-SERVICES` | **Engineering Core** | Site Reliability Engineer (SRE) |
| **BUILD** | `WS-DATA` | **Data & AI Specialist** | Security Specialist |
| **DOCS** | Any | **Specialist Role** | COO / Human Operator |
| **AUDIT** | `WS-INFRA` / `WS-REPOS` | **Site Reliability (SRE)** | Security Specialist |
| **AUDIT** | Any Security track | **Security Specialist** | Site Reliability (SRE) |

### Context Assembly Guidelines
Before dispatching a ticket to a sub-agent, the COO assembles the execution context:
1.  **Prerequisite Extraction**: Identifies all files listed in the ticket's description or task parameters.
2.  **Dependency Verification**: Confirms that all tickets listed under the `blocked_by` front-matter field have status `status: DONE` and are archived. If a dependency is active, the COO marks the task `status: BLOCKED` and halts execution, outputting a notification details statement.
3.  **State Loading**: Collects all previous Handoff Logs to provide chronological context to the executing agent.

---

## 🛡 Governance & Safety Rules

To prevent runaway agent execution or destructive actions, the COO enforces **Three Structural Barriers**:

### 1. The Token Budget Gate
Each active agent session is assigned a maximum token budget and invocation limit. The COO acts as a watchdog:
*   Monitors token usage logs during execution.
*   Enforces a hard halt if an agent reaches 90% of its budget, pausing the session and requesting human review to prevent infinite-loop costs.

### 2. File-Access Sandboxing
*   Agents are permitted to write files only inside their assigned repository directory boundaries.
*   System directories, hidden IDE structures, and user environment files (`.env`) are strictly write-protected. Only the SRE agent, under explicit user authorization, can update environment configurations.

### 3. Destruction Gate (Explicit Approval)
Any destructive operation (e.g., deleting untracked folders, forcing Git branch overwrites, or pruning running containers) triggers a **Human-in-the-Loop** block. The COO will halt execution, print the exact proposed cutover command, and wait for human confirmation.
