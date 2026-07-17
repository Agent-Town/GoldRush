# Task lane-b-e7-relay-valley-contract: the E7 signature tile as DATA — contract + mask table (feeds 3D-D) (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/epoch-saga/e7-signal-bundle.md §B (THE RELAY VALLEY — ridgeline relay chains, LOS placement, dead-zone fog pockets, the record-a-patrol teaching contract; extract, NEVER invent); assets/contracts/epoch-6-atomic/contracts.json + mask-tables/e6-glow-mesa.json (your DIRECT precedent — the e6 slice shipped this exact pattern; mirror its schema key-for-key); assets/contracts/epoch-7-signal/manifest.json (locked era — your contract ships inert).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: epoch-7-signal/contracts.json must list ZERO contracts and mask-tables/ must not exist for e7-relay-valley. If present, STOP and report SHIPPED.

## Why (the 3D-D feeding pipeline — its E7 gate is the only thing between it and the next sculpt; the E6 slice proved this pattern end-to-end same-day)
## Scope
1. Contract entry `e7-relay-valley` in epoch-7-signal/contracts.json (schema-exact vs e6-glow-mesa): tileParams per §B — ridgeline elevation BANDS as named zones (LOS is gameplay: the mask carries ridge/valley classification for the sculptor; sim elevation stays code-owned per the planar law), relay-site build zones along ridgelines, dead-zone fog pockets as named zones, spawn edges, the teaching-contract patrol route as a named lane. Report-don't-invent for any §B gap.
2. Mask table epoch-7-signal/mask-tables/e7-relay-valley.json — core keys exact; additive per-map keys for ridgeBands/fogPockets (the fairground/e6 additive precedent).
3. Node test extension (bounds + no-water truth) + one additive board-gating inertness assertion (locked era, absent from plain boot board).
## Firewall
Touch ONLY: the two data files, node test, one board-gating assertion. NO tile/sim code, NO manifest edits, NO epoch-8+ files, NO src/ beyond the spec.
## Self-check
tsc + build green · node test green · board-gating green desktop+mobile · task-025 unmodified-green · zero console errors plain boot.
No-op guard: if you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + tileParams/zone summary + every report-don't-invent choice — this report is 3D-D's E7 sculpt-grant evidence.
