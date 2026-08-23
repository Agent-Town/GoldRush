# Task e10s-1c-ember-shore-inert-landing: the Ember Shore data lands INERT — anchors emptied, admission parked with the door (lane-a, prefix "fix:", BUILD-ON-PREDECESSOR)

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; **the e10s-1b leaf's blockedReason in tasks/goals.json (F-2165-1 — the measured coupling this corrective resolves) + reviews/e10s-1b-ember-shore-schema-and-data.md §"s2165 RE-GATE"**; src/meta/ContractFamilies.ts — the admission mechanism (s2165 cites `:1345`, s2125 cited `:1336`; the coordinate rots, the fact is: an EMPTY `harvestAnchors` array is what holds a map out of play); e2e/er01-e10-census.spec.ts (the `benchSeeds expected undefined` pin at ~:46, and note its UNRELATED pre-existing red at ~:59 on clean main — fingerprint by LINE); the e6-picnic precedent (the map sat refused-by-empty-data until its door slice earned the anchors: grep BACKLOG "THE PICNIC IS ADMITTED").

## Pre-flight — BUILD-ON-PREDECESSOR (F-2089-1 opt-in; this is NOT the safe-dupe template)
lane/a is DELIBERATELY ahead by exactly one commit: `61358eb55` (`runner(lane-a): e10s-1b-ember-shore-schema-and-data.md`), 7 paths, undrained BY DESIGN — the re-gate holds it. Do NOT reset the lane; build ON that commit. Verify first: `git log --oneline main..lane/a` shows exactly `61358eb55` and nothing else; the worktree is clean apart from the FACTORY-CHURN EXCEPTION classes (F-1407-1: `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — list and proceed). Anything ELSE ahead or dirty: STOP and report. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (F-2165-1, measured by s2165 in a detached control — the evidence is the master's premise)
The predecessor's data slice is sound EXCEPT that its four `harvestAnchors` + `benchSeeds` + two null-floors rows constitute ADMISSION: merged as-is, three door guards red on main (skillmd-guard + door-admission-ratchet, 6 pass/0 fail clean → 3/3 fail merged, two timing-free) plus the census `benchSeeds expected undefined` pin — because admitting ember-shore requires the door surfaces (skill.md +5 lines, door baseline +1) and, deeper, the DOOR LAW's evidence (public-verb prover secures ×2), which does not exist yet. The e6-picnic shape is the house answer: the data lands with empty anchors, and the E10S-4 door slice earns the admission later on evidence.

## Scope
1. On top of `61358eb55`: EMPTY the `harvestAnchors` array and REMOVE the `benchSeeds` key for `e10-ember-shore` in the contract data; remove the two ember-shore rows from `assets/contracts/null-floors.json` by REGENERATING on the resulting tree (`node scripts/null-floor-anchors.mjs` — rows appear only with admission, so the regen drops them itself; `--check` must pass).
2. **PARK the removed payload verbatim** (retention law): the four anchors + the benchSeeds block go into the `e10s-4-ember-shore-door` leaf's note in `tasks/goals.json` (append a `parkedPayload_e10s1c` field quoting them as JSON) so the door slice re-lands them unchanged when the prover earns it. Same commit.
3. Census: keep/restore the `benchSeeds: undefined` expectation for ember-shore at the ~:46 pin; the engine-dependency expectation (`ember-shore-preserve-consumers`) from the predecessor STAYS.
4. Keep untouched from the predecessor: the twist schema (`AUTHORED_TWIST_KEYS` + `DECLARED_INERT_PATHS` + `engineDependencies`), the mask table, the e3-mask-tables pin fix, the squallDecayPerSecond settlement.
5. Prove the re-gate's exact reds go green: `skillmd-guard` + `door-admission-ratchet` legs pass on YOUR tree (they are in the node-guard batteries — find their npm targets by reading scripts/run-guards.mjs); `er01-e10-census.spec.ts` green at ~:46 for ember-shore, with the pre-existing clean-main red at ~:59 UNTOUCHED and fingerprinted BY LINE in your report (it is not yours to cure and not yours to hide).

## Firewall
Touch ONLY: the ember-shore contract data file, `assets/contracts/null-floors.json` (regen), `e2e/er01-e10-census.spec.ts` (the ember-shore expectations only), `tasks/goals.json` (the parkedPayload append ONLY — no status flips), BACKLOG row. NO changes to: `src/**` (the schema landed with the predecessor and stands), `public/skill.md`, the door baseline, any other contract, other census rows.

## Self-check (evidence, not vibes)
tsc + `npm run build` green; floors regen `--check` rc=0 with NO ember-shore rows and 0 secured:true anywhere; the two door guards green; census ember-shore assertions green both projects; task-025 + m1-01 unmodified-green. End: READY-FOR-GATES + report: the guard verdicts clean-vs-yours, the parked payload's exact location, the :59 fingerprint line.

## No-op / honesty guard
If emptying the anchors does NOT turn the three door-guard reds green (a fifth coupling exists), STOP and report the residual red verbatim — the drain decision then returns to attended with your measurement as its premise.
