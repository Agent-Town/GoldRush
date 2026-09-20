# Task l4-ledger-backup-discipline: the county book survives the box (lane-d, prefix "ops:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; specs/ops/ledger-on-droplet.md (Law 3 — this slice is its backup half; L3 EXECUTED, the measured paths below are live); docs/ops/agenttown-server.md §"The ledger service" (db at `/opt/goldrush-ledger/ledger.db`, WAL mode, the manual backup form recorded there); server/ledger/storage.mjs (the sqlite adapter whose db you back up).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff — c6's runner commit IS merged at `eec0399c4`), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): changes confined to `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` are NEVER a STOP — list and proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (spec Law 3, now live: since the L3 cutover the sqlite file is the ONLY copy of every future standing)
The book started empty by owner amendment, but every run submitted from now on exists in exactly one file on a 1GB box. Law 3, verbatim: "nightly `sqlite3 .backup` + rotate locally AND mirror … restore drill documented in the runbook before cutover is called done." The mirror target is REVISED by the authoring session with a reason: the box holds no Cloudflare token and provisioning one adds a secret + a failure mode, while the Mac already holds the SSH key and the git origin IS the offsite — so the mirror is a PULL into git, not a push to KV.

## Scope
1. **The droplet-side nightly backup** (files into `ops/droplet/`, installed by attended — you do NOT ssh): `ops/droplet/ledger-backup.mjs` (node 26; `VACUUM INTO` a dated file — safe on a live WAL db, no sqlite3 CLI dependency; refuse to overwrite; prune local copies older than 14 days **by named-file iteration with the retention-law comment — no bare `find -delete`**) + `ops/droplet/goldrush-ledger-backup.service` + `.timer` (daily, RandomizedDelaySec, `MemoryMax=128M`).
2. **The pull-side mirror** (runs on the Mac): `scripts/ledger-backup-pull.mjs` — rsync the newest backup from the box into `artifacts/ledger-backups/` (idempotent: skip if today's file already present; print what it pulled or why not). It must be SAFE TO RUN ANY TIME (a fire or attended session invokes it; wiring it as a standing fire duty is attended's follow-up, not yours — say so in the report).
3. **The restore drill, executed not just documented**: a test that (a) creates a scratch db via the storage adapter, writes known rows, (b) backs it up with the droplet script's own VACUUM INTO path (locally), (c) restores by pointing a fresh adapter at the backup, (d) asserts the rows byte-match. Wire it into an existing node test battery (read scripts/run-guards.mjs for where content guards live). Then write the runbook §"Restore drill" with the exact operator commands for the real box.
4. **Runbook**: replace the manual-form sentence with the timer + pull + drill procedure.
5. NO live-box changes, no fire.md edits, no secrets anywhere.

## Firewall
Touch ONLY: `ops/droplet/**` (new files), `scripts/ledger-backup-pull.mjs` + its test, `docs/ops/agenttown-server.md` (the backup section), `package.json` (test target if needed), BACKLOG row. NO changes to: `server/ledger/**` logic, `scripts/assay-*`, any deploy script, `specs/**`.

## Self-check (evidence, not vibes)
tsc + `npm run build` green; the restore-drill test green in its battery; `node scripts/ledger-backup-pull.mjs --dry-run` (build the flag) prints a sane plan against an unreachable host without hanging (bounded timeout). End: READY-FOR-GATES + report: the drill's row-match proof, the prune-safety shape, what attended must install (exact commands), the fire-duty follow-up note.

## No-op / honesty guard
If `VACUUM INTO` is unavailable in the shipped node:sqlite, STOP on that item and report the alternative you measured (backup API, or the sqlite3 CLI as an apt dependency) — never ship an untested backup path: an unrestorable backup is worse than none, because it looks like one.
