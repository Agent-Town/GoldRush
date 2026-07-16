# Task lane-d-tp00-tile-persistence-substrate: TP-00 — the "what stays" substrate, INERT (LANE-D, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/tile-persistence/README.md (THE LAW for this slice — all six laws + TP-00; implement exactly that, nothing past it); src/game/ProfileStorage.ts (the gr.profile.v2 scope pattern — law 1 lives or dies here); src/meta/ContractFamilies.ts (tile/contract construction seam — where read-at-birth will eventually attach; this slice only NAMES the seam in types, wires nothing).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

SEQUENCING LAW: this task assumes lane-d-e7-determinism-audit ran FIRST (same lane, queued ahead). If the audit's report (artifacts/e7-determinism-audit/report.md) does not exist on your base, STOP and report "audit not landed" — the substrate's determinism gate presumes an audited sim.

GROUND-TRUTH pre-flight: grep `TileStateStore\|tilestate` across src/ — absent = BUILD IN FULL. If present, STOP and report SHIPPED.

## Why (tile-persistence TP-00; owner founding verbatim 2026-07-10: "It is a bit sad that the map and the buildings reset after each game.")
E9's era-defining system, built early and inert so its risks surface years of eras ahead of its debut (e5-03 precedent). W6 (the Dredge-Queen's wreck, building on lane-b) ships with its own flag and migrates onto this at TP-01.

## Scope
1. **TileStateStore** (new, src/game/TileStateStore.ts): the envelope + API per spec laws — `readSnapshot(contractId)` (once, at-birth semantics), `stageWrite(contractId, entry)` + `commitAtRunEnd()` (write-at-end law), entries = `{ kind: 'sim' | 'render', id, payload, schemaVersion }`; storage under `gr.profile.v2.<profileId>.tilestate.<contractId>` (law 1 — use ProfileStorage's own scope helpers, never hand-rolled keys); unknown-key preservation (law 2); 32KB budget with LOUD whole-write refusal (law 5); no clear() on the normal path (law 6).
2. **The Loader Contract, typed only**: export the `TileStateEntry` consumer interface + a `applyAtBirth(entries, tileParams)` NO-OP stub with the contract documented — the seam future consumers implement. Nothing calls it in this slice (INERT law).
3. **New spec e2e/tp00-tile-persistence.spec.ts** (GATE-AUTHORSHIP — assert exactly, desktop AND mobile, all `?debug`-driven):
   a. PROFILE ISOLATION: entries staged+committed under profile A are invisible under profile B; switching back to A restores them byte-identically.
   b. VERSION SAFETY: a snapshot written with an extra unknown key survives a read+stage+commit cycle byte-preserved.
   c. BUDGET LAW: an over-32KB staged write is refused whole, surfaces a warning, and leaves the prior snapshot untouched.
   d. DETERMINISM COMPOSABILITY: two same-seed runs with an identical (spec-injected) snapshot produce identical event logs; changing the snapshot changes nothing after tick 0 EXCEPT through the no-op path (i.e., today: nothing — the divergence test arms for real at TP-02 and is written now as the contract's guard, expecting zero divergence while applyAtBirth is a stub).
   e. INERT proof: plain boot writes nothing under any tilestate key; task-025 baseline unmodified-green.
4. **Balance/config**: the 32KB budget constant where the house keeps such numbers.

## Firewall
Touch ONLY: the new store file, ProfileStorage additive scope helper if needed, the spec, typing. NO tile factory wiring, NO consumers, NO W6 migration (that is TP-01, after the boss merges), NO sim/render behavior change of any kind.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. tp00 spec green desktop+mobile. Adjacent unmodified-green both projects: task-025 baseline, board-gating-and-profiles (the profile-scope neighbors). Zero console/page errors.
No-op guard: if you exit without changes, WRITE WHY into your report first.
End: READY-FOR-GATES + report: the envelope schema as landed, the budget-refusal evidence, and any ProfileStorage scope surprises as findings (the poison-class memory says there WILL be one — prove it wrong).
