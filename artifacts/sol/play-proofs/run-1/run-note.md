# Native play proofs — five-map run handoff

2026-09-25. **READY-FOR-GATES**, with one full proof, one partial proof and three failed proofs. This run closes after the first five maps, within the requested three-to-six-map batch. No quota failure or disconnect is claimed. Base: `0c0179197cf8c6f4de582b637348481eeb4ba778`; branch: `sol/map-art-campaign-2`.

| Map | Desktop / phone outcome | Finding / evidence |
| --- | --- | --- |
| Baron | FAIL: died wave 16 / 23 | F-PP1-1; phone boss retained 62.3% HP. [Finding](e1-baron/finding.md) |
| Twin Banks | FAIL: died wave 19 / 18 | F-PP1-2; expansion and survival remained insufficient. [Finding](e1-twin-banks/finding.md) |
| Pressure Garden | FAIL: died wave 3 / 11 | F-PP1-3; all coal seams reached; phone commissioned three boilers but observed only two hot together. [Finding](e2-pressure-garden/finding.md) |
| Incline | PASS: wave 14 / 14, all six cells | Cart delivered at 180/180 HP, railcar defeated, banked, Book returned, reload score unchanged. [Proof](e2-incline/proof.md) |
| Blackout Ridge | PARTIAL: wave 12 / 12, bank/Book/reload pass | F-PP1-5; full authored goal unproved. Phone built both banks and performed eight repairs, but banks finished wrecked and sampled storage peaked at zero. [Finding](e3-blackout-ridge/finding.md) |

All ten final rows report zero console/page errors. Failed attempts are evidence about these strategies, not proof that a map is impossible. Full objective assertions remain enabled behind the gate; the four unresolved maps are not called green. Two honest unsuccessful attempts per unresolved map are recorded; stop and hand off rather than silently retrying forever.

## Method and adaptations

Real WASD, Space, upgrade keys and HUD clicks; reference progressed-profile localStorage seeding and permitted timescale 4; read-only diagnostics. No production, contract, balance, art store, existing-test or config changes. One worker, desktop 1280×800 then phone 390×844, own Vite port 5303. Owned Vite PID 94296 was stopped at closeout.

The shared driver adapts route/build orders to each map, retries the real build tray after upgrade interruptions, and shortens movement pulses to reduce overshoot. The Incline requires the actual Book launch to select escort mode (resolved F-PP1-4); holding the lower-yard defenses after wave 8 succeeded where further resource trips failed. Banking compares against pre-play scores because secure already persists a score before Return to Town, correcting census instrument F-MPP1-1. Plain reload preserves the complete score bytes and the Book is reopened on foot. Trace recording is disabled for these long runs after a completed phone play hit trace-packaging trouble; raw earlier traces remain local and ignored.

## Verification

- Preflight and final `npm run build`: PASS, including TypeScript and asset checks; final output in [build-final.log](build-final.log). Explicit TypeScript checks also passed; the retained intermediate Incline type-error log predates its fixes.
- `npx playwright test --list --workers=1`: PASS, [collection](default-list.log).
- Gate unset, both projects, `e2e/native-proofs`, `--workers=1`: **10 skipped, exit 0**, [gate check](gate-unset.log). Collection alone does not prove skipping; this actual invocation does.
- Existing, unmodified `e2e/locked-win.spec.ts --grep 'The Claim card names'`, both projects, `--workers=1 --trace off`: **2 passed, exit 0**, [adjacent check](adjacent.log). This is a bounded adjacent check, not the full existing suite.
- Enabled Incline proof: desktop and phone PASS. Other enabled proofs retain their failing full-objective assertions and findings.
- [Scope and row verification](verification.json): only allowed paths; exactly five status rows changed, second column only; all ten terminal PNGs present; Book PNGs for banked rows; both Incline rows pass all six cells.

Browser invocations use `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303`; enable a chosen map with `GR_NATIVE_PROOF=1 npx playwright test e2e/native-proofs/<contract-id>.spec.ts --project=<desktop-chrome|mobile-chrome> --workers=1 --reporter=line --output=artifacts/sol/play-proofs/run-1/<contract-id>/<project>-results`. Start the owned server with `npm run dev -- --port 5303 --strictPort`. Per-map logs preserve the actual strategy variants used. The phone Incline hold was explicit during exploration; holding is now the driver's default.

## Preflight and discarded churn

No ahead commits or undrained source work; only untracked log churn. Ran the task's reset/clean, install and build. Restored npm-only optional-libc lock metadata churn before work; clean status verified. Explicitly authorized clean discarded these regenerated paths:

- `artifacts/blackout-ridge/`
- `artifacts/board-upcoming/`
- `artifacts/e4-vehicles-fuel/`
- `artifacts/raise-at-site/`
- `artifacts/sol/map-art-campaign-2/run-10/entry-framing/e1-night-shift/own-results/e1-night-shift-a-lantern-p-0db8c-sland-readable-at-true-dark-desktop-chrome/`
- `artifacts/sol/map-art-campaign-2/run-10/entry-framing/e1-night-shift/own-results/e1-night-shift-a-lantern-p-0db8c-sland-readable-at-true-dark-mobile-chrome/`
- `logs/guard-stats.jsonl`

The task firewall excludes Obsidian writes; durable handoff stays in this allowed artifact tree.

## Commits

- `a04141aef` — Baron.
- `562d496d3` — Twin Banks.
- `f487ad696` — Pressure Garden.
- `b3582cf4d` — Incline.
- Blackout Ridge and final handoff: the containing `test: record Blackout Ridge partial proof and close run` commit (hash reported in the final response).

## REMAINING LIST IN ORDER

Current unresolved map first, then untouched continuation in task order, then earlier failed holds. The next **untouched** map is Canyon Works. Do not treat the earlier failed maps as passed or repeat their two-attempt batch without a planned follow-up.

1. e3-blackout-ridge — current partial, F-PP1-5.
2. e3-canyon-works.
3. e3-fairground.
4. e4-dust-flats.
5. e4-gusher-county.
6. e4-boneyard.
7. e8-far-side.
8. e8-low-orbit.
9. e8-eclipse.
10. e9-dome-basin.
11. e9-seed-run.
12. e9-devils-alley.
13. e9-old-canal.
14. e10-last-claim.
15. e10-river.
16. e1-baron — earlier failed hold, F-PP1-1.
17. e1-twin-banks — earlier failed hold, F-PP1-2.
18. e2-pressure-garden — earlier failed hold, F-PP1-3.

For the orchestrator's original-order inventory, all remain unproved except e2-incline: e1-baron, e1-twin-banks, e2-pressure-garden, e3-blackout-ridge, e3-canyon-works, e3-fairground, e4-dust-flats, e4-gusher-county, e4-boneyard, e8-far-side, e8-low-orbit, e8-eclipse, e9-dome-basin, e9-seed-run, e9-devils-alley, e9-old-canal, e10-last-claim, e10-river.
