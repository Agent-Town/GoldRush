# Task lane-b-e8-orbital-contract: the E8 signature tile as DATA — contract + mask table (feeds 3D-D) — **FIRE-AUTHORED (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/epoch-saga/e8-orbital-bundle.md §B (THE MARE CLAIM — crater rim ring h=6 premium/debris-exposed pads, mare flat h=0 with LOW GRAVITY lob arcs, lava-tube mouth as a procgen interior sub-tile, dome cluster pads + launch pad + mass-driver rail, regolith/He-3 fields, AIR-is-the-wall suit timer outside domes; extract, NEVER invent); assets/contracts/epoch-7-signal/contracts.json + mask-tables/e7-relay-valley.json (your DIRECT precedent — the e7 slice shipped this EXACT pattern same-day, drain s691; mirror its schema key-for-key); assets/contracts/epoch-6-atomic/contracts.json + mask-tables/e6-glow-mesa.json (the additive-per-map-keys precedent); assets/contracts/epoch-8-orbital/manifest.json (locked era, `locked:true` — your contract ships INERT).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits, and lane/m4 is currently a FALSE-AHEAD dupe of e7-relay-valley (its content is already on main via drain s691 `01689e11`). For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: epoch-8-orbital/contracts.json must list ZERO contracts and mask-tables/ must not exist for e8-orbital (or e8-mare-claim). If present, STOP and report SHIPPED.

## Why (the 3D-D feeding pipeline — its E8 gate is the only thing between it and the next orbital sculpt; the E6 slice proved this pattern end-to-end, the E7 slice repeated it clean same-day at drain s691. "E8+ contract slices follow the same pattern per drain" — BACKLOG 2026-07-17. Owner directive: "Take your time but do them perfect.")

## Scope
1. Contract entry `e8-mare-claim` in epoch-8-orbital/contracts.json (schema-exact vs e7-relay-valley / e6-glow-mesa): tileParams per §B —
   - **crater rim** as named elevation BANDS (h=6 rim ring, premium/debris-exposed pads) — LOS is gameplay: the mask carries rim/mare classification for the sculptor; sim elevation stays code-owned per the planar law #6;
   - **mare flat** as the h=0 zone;
   - **relay/dome build zones**: dome-cluster pads, launch pad, mass-driver rail footing (as build zones + a named rail if the e6/e7 `rails` key fits);
   - **lava-tube mouth** as a named zone (the procgen interior sub-tile ENTRANCE only — interior generation is a FUTURE slice, do NOT author interior geometry here);
   - **regolith/He-3 fields** as harvest anchors or named zones per the e7 precedent;
   - **spawn edges** + the era's telegraphed **debris-arc** hazard lanes as a named lane (mirror e7's `lanes.patrolRoutes` shape; the debris-rain arcs are the era's "storm" — carry their telegraph path as data);
   - **gravity/atmosphere** as inert named tileParams (§B: 0.6g feel / lob arcs 2.4× longer; AIR = suit timer outside domes) — carry the VALUES §B states; do NOT wire any sim consumption (§C flags gravity/atmosphere as a FUTURE GT engine prereq). `river:false`, `ford:false`, no water sources (airless mare). `heightfield.mode:"visual"`.
   Report-don't-invent for any §B gap (numeric extents the diagram implies but doesn't state — choose consistent with e7's coordinate conventions and LIST every such choice in the END summary).
2. Mask table epoch-8-orbital/mask-tables/e8-mare-claim.json — core keys exact vs the authored contract; additive per-map keys for the rim bands / mare flat / lava-tube mouth / debris-arc lanes / gravity+atmosphere (the fairground/e6/e7 additive precedent). Extend the node test's bounds-walk to cover every new zone/point array you add.
3. Node test extension in scripts/e3-mask-tables.test.mjs (bounds + no-water truth): register e8 in the era resolver (`id.startsWith('e8-') ? 'epoch-8-orbital'`) + the contract set (`...e8Contracts`) + the exact-track key list + source pointer (`specs/epoch-saga/e8-orbital-bundle.md §B`) + the bounds+no-water suite; add explicit `assert.deepEqual` checks for the new rim/mare/lava-tube/debris keys (mirror e7's ridgeBands/fogPockets assertions). PLUS one additive board-gating inertness assertion in e2e/board-gating-and-profiles.spec.ts: `contract-card-e8-mare-claim` has count 0 in a plain (epoch-1) boot (locked era, absent from board).

## Firewall
Touch ONLY: the two data files (contracts.json + the new mask-table), the node test, and one board-gating assertion. NO tile/sim code, NO manifest edits, NO epoch-9+ files, NO procgen-interior code, NO gravity/atmosphere SIM wiring, NO src/ beyond the spec.

## Self-check
tsc + build green · `node --test scripts/e3-mask-tables.test.mjs` green (all prior + new e8 cases) · board-gating-and-profiles green desktop+mobile · adjacent task-025-bandits-dont-swim unmodified-green · zero console errors plain boot.
No-op guard: if you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + tileParams/zone summary (rim/mare/lava-tube/dome-pads/launch/mass-driver/gravity/atmosphere) + every report-don't-invent choice (esp. any coordinate extents and any §B numeric gap) — this report is 3D-D's E8 sculpt-grant evidence.
