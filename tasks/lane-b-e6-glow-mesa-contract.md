# Task lane-b-e6-glow-mesa-contract: the E6 signature tile as DATA — contract + mask table (feeds 3D-D's sculpt pipeline) (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/epoch-saga/e6-atomic-bundle.md §B (THE GLOW MESA — the layout, objectives, decay fields, herd paths, warehouse, night veins, DECAY CLOCK site; extract, NEVER invent); assets/contracts/epoch-5-deepwater/contracts.json + assets/contracts/epoch-4-motor/contracts.json (the contract schema precedents — e5-deepwater-claim is the freshest); assets/contracts/epoch-5-deepwater/mask-tables/e5-deepwater-claim.json + epoch-3-voltage/mask-tables/e3-fairground.json (mask schema, key-for-key); assets/contracts/epoch-6-atomic/manifest.json (the era is LOCKED — your contract ships inert).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: `assets/contracts/epoch-6-atomic/contracts.json` must currently list ZERO contracts (verified 2026-07-17). If e6-glow-mesa exists, STOP and report SHIPPED.

## Why (the Sol feeding pipeline, owner 2026-07-17: "Can you also start to do all the tasks for 3D-D and 3D-C or what is needed to feed them tasks?")
3D-D's slate is complete (15/15) and it holds for lack of contracts — masks-first law means sculpt grants activate only when a contract + mask-table FILE lands. This slice is the E6 pipeline-opener: the Glow Mesa as pure DATA (contract + mask), inert behind the locked epoch. The TILE CODE (decay puddles, wind-down) is a separate later slice gated on the decay framework — do NOT build tile logic here.

## Scope
1. **Contract entry** `e6-glow-mesa` in assets/contracts/epoch-6-atomic/contracts.json — schema-exact vs the e5/e4 precedents: tileParams (size/dimensions per §B's layout; no river/ford — a mesa), buildZones (the base flat + the DECAY CLOCK site + the warehouse approach per §B's ASCII), spawn edges (warehouse side + scarp herd-paths), fixture footprints (Calculating House megaproject site + doorless dome, as zones), board metadata mirroring how e5-deepwater-claim presents while locked. Every value extracted from §B; where §B gives no number, choose the conservative analog from the e5 precedent and REPORT the choice (report-don't-invent).
2. **Mask table** `assets/contracts/epoch-6-atomic/mask-tables/e6-glow-mesa.json` — key-for-key schema vs siblings (maskTruth + waterAgreement; waterSources empty, river false); include the decay-puddle FIELDS as named zones in the additive per-map style (the fairground precedent: additive keys allowed, core keys exact).
3. **Node check**: extend the mask-table test pattern (the e3 chore's node --test precedent) to cover the new table: coordinates in bounds, water truth consistent.
4. **Inertness proof**: the epoch stays locked — assert (in the existing board-gating spec's pattern, additive) that e6-glow-mesa does NOT appear on the plain-boot board.

## Firewall
Touch ONLY: the two new data files, the node test, one additive board-gating assertion. NO tile factory/sim code, NO manifest changes (locked stays locked), NO src/ beyond the single spec file, NO epoch-7+ files.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. Node test green. Board-gating spec green desktop+mobile (incl. the new inertness assertion). task-025 baseline unmodified-green. Zero console/page errors in a plain boot.
No-op guard: if you exit without changes, WRITE WHY into your report first.
End: READY-FOR-GATES + report: the tileParams summary (zones/edges/sizes), every report-don't-invent choice made, and the mask-table zone list — this report is 3D-D's sculpt-grant evidence.
