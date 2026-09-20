# Task harness-disclosure-field: sim-import is lawful WITH disclosure — the law reaches the door, the stack, and the board (lane-b, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; **the OWNER RULING in the Why**; docs/bench/harness-era-implications.md (F-HARNESS-1 — the question this answers, with the ARC-era context); public/skill.md (the door document — SOURCE-LOCKED by scripts/skillmd-guard.test.mjs + e2e/skillmd-door.spec.ts: read BOTH guards before editing one line, and update their expectations lawfully in the same commit — never loosen, re-pin); functions/api/standings.ts + server/ledger/serve.mjs (the stack validation lives behind the L1 seam — whatever you add must validate identically on BOTH backends); specs/agent-play/ap-15-assay-of-minds.md (RATIFIED — Law 4 "self-declaration extends… the honesty law covers them" is the pattern this field joins; Law 1 keeps ranking species-blind and outcome-based).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): changes confined to `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` are NEVER a STOP — list and proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (owner ruling 2026-08-24, verbatim: "yes, that is fine, lawful with disclosure")
F-HARNESS-1 asked whether a harness may import the county's open sim as a world model for ranked play. The owner ruled the recommendation: LAWFUL, WITH DISCLOSURE — a model-aided field shown as information, never a ban and never a ranking factor. Serious harnesses will do this within days of the bounty; the county's answer must be in the door document before the announcement.

## Scope
1. **The stack field**: the submission stack gains optional `worldModel` (suggested vocabulary: `"sim-import"` | `"none"` | a short free string ≤64 — read how `harness`/`harnessVersion` validate and match their strictness; absent = undeclared, valid). Additive: every existing submission stays valid. Both backends via the L1 seam.
2. **The door document**: public/skill.md states the law in the county's voice, ≤4 lines: importing the open sim as a world model is lawful; declare it in the stack's `worldModel`; the honesty law (existing skill.md section — cite it in place) covers the declaration; ranking is unaffected. Update skillmd-guard + the door spec pins to the new content IN THE SAME COMMIT (re-pin, never loosen).
3. **The board render**: wherever the stack renders (the Field Book strip / row detail from ap15-frontier-registry — read what shipped at `241ba0301`), the declaration shows as information. NO ranking change (spec Law 1 — if any ordering code path touches the field, STOP).
4. Tests: validator accepts with/without + rejects oversize; the render shows declared and absents undeclared honestly; skillmd-guard green on the new content; both-backend suites green.
5. docs/bench/harness-era-implications.md: the F-HARNESS-1 line gains the ruling verbatim + date (one line, the record).

## Firewall
Touch ONLY: functions/api/standings.ts (stack validation, additive), public/skill.md (+ its two guards' pins), the render surface ap15 shipped, docs/bench/harness-era-implications.md (one line), tests, BACKLOG row. NO changes to: ranking/ordering, verdict flow, sim, tapes, server/ledger/serve.mjs logic (the seam carries functions changes automatically — verify, don't edit).

## Self-check (evidence, not vibes)
tsc + `npm run build` green; test:stats + the standings suites green BOTH backends; skillmd-guard + the door e2e green on the re-pinned content; zero console/page errors plain boot. End: READY-FOR-GATES + report: the field's vocabulary as shipped, the skill.md lines verbatim, proof ranking paths are untouched (name the ordering functions you verified).

## No-op / honesty guard
If the door baseline or skillmd-guard cannot be re-pinned without loosening (a structural conflict), STOP and report — the door's integrity outranks this field's urgency.
