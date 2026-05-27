# ZAF Session Bootstrap

This document provides the standard operating checklist for human operators and autonomous agents entering the **ZO Agentic Framework (ZAF)** workspace. 

Following this start-of-session protocol ensures that local clones remain current, conflicts are avoided, and task execution adheres to strict hygiene standards.

---

## 🥾 Cold-Start Checklist

Before editing any file or executing any command in the workspace, you **MUST** run through the following five bootstrap steps:

### 1. Confirm Repository Status
Check the git state of the target repository:
```bash
git status --porcelain
```
*   **If clean**: Proceed to Step 2.
*   **If dirty (uncommitted changes exist)**: Stop immediately. Do not pull or reset. Inform the operator of the exact state first.

### 2. Sync with Upstream
Fetch remote changes to ensure the local branch is up-to-date with its origin:
```bash
git fetch origin
git status --branch --ahead-behind
```
*   **If behind**: Perform a fast-forward merge:
    ```bash
    git pull --ff-only
    ```
*   **If ahead**: Warn the operator that local commits are not yet pushed.
*   **If diverged**: Halt immediately. Do not attempt manual merges. Contact the operator for explicit resolution.

### 3. Read Active Registry
*   Open the active Ticket Index (**`WIP/tickets/TICKETS.md`**).
*   Identify the highest-priority active ticket assigned to your role that is not marked `BLOCKED` or `WAITING_INPUT`.
*   Locate and read the corresponding ticket file under **`WIP/tickets/ACTIVE/TKT-*.md`**.

### 4. Load Handoff Context
*   Navigate to the `## Handoff Log` at the bottom of the active ticket.
*   Read the last log entry to understand the current task state, remaining challenges, and immediate next steps.

### 5. Verify Tooling Status
*   Ensure that the ZAF parser server is active:
    ```bash
    cd dashboard
    npm run dev
    ```
*   Verify that your browser is connected to the dashboard telemetry stream at `http://localhost:4242` (live indicator dot should be pulsing green).

---

## 💻 During the Session

### 1. Single-Source-of-Truth
Keep the active ticket description up-to-date. If you discover new blockers or design issues:
*   Do not patch them silently.
*   Log the blocker under the ticket's `blocked_by` array or log an **Open Question (OQ)** in the parent programme file.

### 2. Clean Git Hygiene
*   Limit changes to the scope defined in the active ticket's acceptance criteria.
*   Do not bundle unrelated fixes or edits into a single session commit.

---

## 🏁 End-of-Session Handoff Protocol

When ending a session or preparing to hand off work:

### 1. Write Handoff Entry
Append a new entry to the chronological **Handoff Log** inside the active ticket:
```markdown
- YYYY-MM-DD | [your-role] | [STATUS] — Concise summary of what you built, remaining work items, and any blockages.
```

### 2. Update Indices
If the ticket status transitioned (e.g., from `IN_PROGRESS` to `DONE`):
*   Change the ticket front-matter metadata `status`.
*   If `DONE`, move the ticket file to `WIP/tickets/ARCHIVED/`.
*   Re-run the parser (`node parse.js`) or let the SSE server auto-update.
*   Rewrite the index lines in `TICKETS.md` and `TICKETS-ARCHIVED.md` to reflect disk state.

### 3. Stage & Commit
Commit all staged files inside the repository:
```bash
git add .
git commit -m "feat([workstream]): concise commit description aligning to TKT-[ID]"
```

### 4. Push to Upstream
If safe and remote connectivity is available, push to your configured origin:
```bash
git push
```
