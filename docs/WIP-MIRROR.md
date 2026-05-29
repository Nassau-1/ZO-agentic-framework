# WIP Mirror — Off-T418 Ticket Backup

Context: `WIP/` is gitignored in the zaf repo (by design — the ticket corpus is operational state
not meant to ship to end users). That means the entire ticket system (ACTIVE/, ARCHIVED/,
TICKETS.md, programmes) lives only on T418's filesystem. TKT-ZAF-0059 tracks this gap.

## Strategy chosen: dedicated private mirror repo

A separate **private** GitHub repo (`Nassau-1/zaf-wip`) mirrors `01_Repos/zaf/WIP/` verbatim.
The mirror commit identity matches the workspace standard (`Nassau-1 / enzoterrier@gmail.com`).
The sync script lives at `03_Scripts/sync-zaf-wip.ps1`.

Rationale for a dedicated repo over extending the Codex mirror:
- Codex mirror (`01_Repos/Codex/`) holds governance docs — mixing operational ticket state there
  blurs the boundary between "rules that govern work" and "work being done".
- A dedicated repo is easily revoked if ZAF tickets become sensitive or are handed to a team.

## One-time setup (first time only)

```powershell
# 1. Create the private mirror repo on GitHub
gh repo create Nassau-1/zaf-wip --private --confirm

# 2. Clone it into the workspace
git clone git@github.com:Nassau-1/zaf-wip.git C:\Users\LENOVO\Workspace\01_Repos\zaf-wip

# 3. Do the first sync + push
.\03_Scripts\sync-zaf-wip.ps1 -Init
```

## Ongoing usage

Run at the end of any session that touches tickets:

```powershell
.\C:\Users\LENOVO\Workspace\03_Scripts\sync-zaf-wip.ps1
```

Dry-run mode (shows diff, no writes):

```powershell
.\...\sync-zaf-wip.ps1 -DryRun
```

## Recovery on a fresh T418

```powershell
# 1. Clone the mirror
git clone git@github.com:Nassau-1/zaf-wip.git C:\Users\LENOVO\Workspace\01_Repos\zaf-wip

# 2. Clone the main zaf repo
git clone git@github.com:Nassau-1/zaf.git C:\Users\LENOVO\Workspace\01_Repos\zaf

# 3. Restore WIP/ from the mirror into the zaf repo
.\C:\Users\LENOVO\Workspace\03_Scripts\sync-zaf-wip.ps1 -Restore
```

The restore copies all files from `zaf-wip/` back into `zaf/WIP/`.  
It does NOT touch source code, `dashboard/`, or any other part of the zaf repo.

## What is NOT covered

- In-memory PTY process state (lost on restart by design — covered by TKT-ZAF-0057 backup policy).
- `dashboard/config.json` changes mid-session if they weren't committed (covered by TKT-ZAF-0057's
  hourly backup engine to `02_Runtime/zaf-backups/`).
